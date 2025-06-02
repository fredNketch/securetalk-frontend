import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, catchError, map, tap, interval } from 'rxjs';
import {
  Message,
  Conversation,
  UserInfo,
  SendMessageRequest,
  TypingIndicator,
} from '../models/messaging.models';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private readonly apiUrl = 'https://localhost:8443/api';

  // Signals pour l'état de la messagerie
  private readonly _conversations = signal<Conversation[]>([]);
  private readonly _activeConversation = signal<Conversation | null>(null);
  private readonly _messages = signal<Message[]>([]);
  private readonly _typingUsers = signal<TypingIndicator[]>([]);
  private readonly _loading = signal(false);
  private readonly _searchQuery = signal('');

  // Computed values publics
  readonly conversations = this._conversations.asReadonly();
  readonly activeConversation = this._activeConversation.asReadonly();
  readonly messages = this._messages.asReadonly();
  readonly typingUsers = this._typingUsers.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();

  readonly unreadCount = computed(() => {
    return this._conversations().reduce(
      (count, conv) => count + conv.unreadCount,
      0,
    );
  });

  readonly filteredConversations = computed(() => {
    const query = this._searchQuery().toLowerCase();
    if (!query) return this._conversations();

    return this._conversations().filter(
      (conv) =>
        conv.participant.username.toLowerCase().includes(query) ||
        conv.participant.firstName?.toLowerCase().includes(query) ||
        conv.participant.lastName?.toLowerCase().includes(query) ||
        conv.lastMessage?.content.toLowerCase().includes(query),
    );
  });

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    // Initialiser les données réelles
    this.startTypingCleanup();
  }

  // Charger les conversations
  loadConversations(): Observable<Conversation[]> {
    this._loading.set(true);

    return this.http.get<Conversation[]>(`${this.apiUrl}/messages/conversations`, this.getHttpOptions()).pipe(
      map((conversations) => {
        this._conversations.set(conversations);
        this._loading.set(false);
        return conversations;
      }),
      catchError(error => {
        this._loading.set(false);
        console.error('Erreur lors du chargement des conversations:', error);
        return throwError(() => new Error('Impossible de charger les conversations'));
      })
    );
  }

  // Charger les messages d'une conversation
  loadMessages(conversationId: number): Observable<Message[]> {
    this._loading.set(true);

    return this.http.get<Message[]>(`${this.apiUrl}/messages/conversation/${conversationId}`, this.getHttpOptions()).pipe(
      map((messages) => {
        this._messages.set(messages);
        this._loading.set(false);

        // Marquer les messages comme lus
        this.markMessagesAsRead(conversationId);

        return messages;
      }),
      catchError(error => {
        this._loading.set(false);
        console.error('Erreur lors du chargement des messages:', error);
        return throwError(() => new Error('Impossible de charger les messages'));
      })
    );
  }

  // Envoyer un message
  sendMessage(request: SendMessageRequest): Observable<Message> {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      return throwError(() => new Error('Utilisateur non connecté'));
    }

    // Préparer le message pour l'API
    const messageRequest = {
      recipientId: request.recipientId,
      content: request.content,
      messageType: request.messageType || 'text',
      replyTo: request.replyTo
    };

    return this.http.post<Message>(`${this.apiUrl}/messages`, messageRequest, this.getHttpOptions()).pipe(
      tap(newMessage => {
        // Ajouter le message à la liste
        this._messages.update((messages) => [...messages, newMessage]);

        // Mettre à jour la conversation
        this.updateConversationWithNewMessage(newMessage);
      }),
      catchError(error => {
        console.error('Erreur lors de l\'envoi du message:', error);
        return throwError(() => new Error('Impossible d\'envoyer le message'));
      })
    );
  }

  // Sélectionner une conversation active
  selectConversation(conversation: Conversation): void {
    this._activeConversation.set(conversation);
    this.loadMessages(conversation.id).subscribe();
  }

  // Recherche dans les conversations
  searchConversations(query: string): void {
    this._searchQuery.set(query);
  }

  // Indicateur de frappe
  startTyping(conversationId: number): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    const typingIndicator: TypingIndicator = {
      userId: currentUser.id,
      conversationId,
      timestamp: new Date(),
    };

    this._typingUsers.update((users) => {
      const filtered = users.filter(
        (u) =>
          u.userId !== currentUser.id || u.conversationId !== conversationId,
      );
      return [...filtered, typingIndicator];
    });
  }

  stopTyping(conversationId: number): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    this._typingUsers.update((users) =>
      users.filter(
        (u) =>
          u.userId !== currentUser.id || u.conversationId !== conversationId,
      ),
    );
  }

  // Marquer les messages comme lus
  markMessagesAsRead(conversationId: number): void {
    // Mise à jour locale
    this._conversations.update((conversations) =>
      conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c,
      ),
    );

    // Appel API pour mettre à jour côté serveur
    this.http.put(`${this.apiUrl}/messages/conversation/${conversationId}/read`, {}, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Erreur lors du marquage des messages comme lus:', error);
          return throwError(() => new Error('Impossible de marquer les messages comme lus'));
        })
      )
      .subscribe();
  }

  // Mettre à jour la conversation avec un nouveau message
  private updateConversationWithNewMessage(message: Message): void {
    this._conversations.update((conversations) => {
      const targetConv = conversations.find(
        (c) =>
          c.participant.id === message.recipientId ||
          c.participant.id === message.senderId,
      );

      if (targetConv) {
        const updatedConv = {
          ...targetConv,
          lastMessage: message,
          lastActivity: message.timestamp,
          unreadCount:
            message.senderId === this.authService.currentUser()?.id
              ? targetConv.unreadCount
              : targetConv.unreadCount + 1,
        };

        // Déplacer la conversation en haut de la liste
        const otherConvs = conversations.filter((c) => c.id !== targetConv.id);
        return [updatedConv, ...otherConvs];
      }

      return conversations;
    });
  }

  // Nettoyage des indicateurs de frappe expirés
  private startTypingCleanup(): void {
    interval(5000).subscribe(() => {
      const now = new Date();
      this._typingUsers.update((users) =>
        users.filter((user) => now.getTime() - user.timestamp.getTime() < 5000),
      );
    });
  }

  /**
   * Obtient les en-têtes HTTP avec le token JWT
   */
  private getHttpOptions() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }
}
