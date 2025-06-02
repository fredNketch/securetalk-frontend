import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, catchError, map, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Message, Conversation, UserInfo, SendMessageRequest } from '../models/messaging.models';

// Interface pour stocker les messages d'une conversation en mémoire locale
interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private readonly apiUrl = 'https://localhost:8443/api';

  // Signals pour l'état des messages
  private readonly _conversations = signal<Map<number, ConversationWithMessages>>(new Map());
  private readonly _activeConversationId = signal<number | null>(null);
  private readonly _loading = signal(false);

  // Computed values publics
  readonly conversations = computed(() => Array.from(this._conversations().values()));
  readonly activeConversationId = this._activeConversationId.asReadonly();
  readonly loading = this._loading.asReadonly();
  
  readonly activeConversation = computed(() => {
    const activeId = this._activeConversationId();
    if (!activeId) return null;
    return this._conversations().get(activeId) || null;
  });

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  /**
   * Récupère la conversation avec un utilisateur spécifique
   */
  getConversation(userId: number): Observable<ConversationWithMessages> {
    this._loading.set(true);
    this._activeConversationId.set(userId);

    return this.http.get<Message[]>(`${this.apiUrl}/messages/${userId}`, this.getHttpOptions()).pipe(
      map(messages => {
        // Créer une conversation avec les messages
        const conversation: ConversationWithMessages = {
          id: userId,
          participant: {
            id: userId,
            username: '', // Sera rempli par le backend
            email: '',    // Sera rempli par le backend
            isOnline: false,
            status: 'offline'
          },
          messages: messages,
          lastMessage: messages.length > 0 ? messages[messages.length - 1] : undefined,
          unreadCount: messages.filter(m => !m.isRead && m.recipientId === this.authService.currentUser()?.id).length,
          totalMessages: messages.length,
          isBlocked: false,
          isPinned: false,
          isMuted: false,
          lastActivity: new Date()
        };

        // Mettre à jour le cache local
        this._conversations.update(conversations => {
          const newConversations = new Map(conversations);
          newConversations.set(userId, conversation);
          return newConversations;
        });

        this._loading.set(false);
        return conversation;
      }),
      catchError(error => {
        this._loading.set(false);
        console.error('Erreur lors de la récupération des messages:', error);
        return throwError(() => new Error('Impossible de récupérer les messages'));
      })
    );
  }

  /**
   * Envoie un message à un utilisateur
   */
  sendMessage(recipientId: number, content: string): Observable<Message> {
    this._loading.set(true);

    const messageRequest: SendMessageRequest = {
      recipientId,
      content,
      messageType: 'text'
    };

    return this.http.post<Message>(`${this.apiUrl}/messages`, messageRequest, this.getHttpOptions()).pipe(
      tap(newMessage => {
        // Ajouter le message à la conversation existante
        this._conversations.update(conversations => {
          const newConversations = new Map(conversations);
          const existingConversation = newConversations.get(recipientId);
          
          if (existingConversation) {
            // Mettre à jour la conversation existante
            const updatedConversation: ConversationWithMessages = {
              ...existingConversation,
              messages: [...existingConversation.messages, newMessage],
              lastMessage: newMessage,
              totalMessages: existingConversation.totalMessages + 1,
              lastActivity: new Date()
            };
            newConversations.set(recipientId, updatedConversation);
          } else {
            // Créer une nouvelle conversation
            const newConversationWithMessages: ConversationWithMessages = {
              id: recipientId,
              participant: {
                id: recipientId,
                username: '', // Sera rempli par le backend
                email: '',    // Sera rempli par le backend
                isOnline: false,
                status: 'offline'
              },
              messages: [newMessage],
              lastMessage: newMessage,
              unreadCount: 0,
              totalMessages: 1,
              isBlocked: false,
              isPinned: false,
              isMuted: false,
              lastActivity: new Date()
            };
            newConversations.set(recipientId, newConversationWithMessages);
          }
          
          return newConversations;
        });

        this._loading.set(false);
      }),
      catchError(error => {
        this._loading.set(false);
        console.error('Erreur lors de l\'envoi du message:', error);
        return throwError(() => new Error('Impossible d\'envoyer le message'));
      })
    );
  }

  /**
   * Marque les messages d'une conversation comme lus
   */
  markAsRead(userId: number): Observable<boolean> {
    const conversation = this._conversations().get(userId);
    if (!conversation) return throwError(() => new Error('Conversation non trouvée'));

    // Mettre à jour localement d'abord
    this._conversations.update(conversations => {
      const newConversations = new Map(conversations);
      const updatedConversation: ConversationWithMessages = { 
        ...conversation, 
        unreadCount: 0 
      };
      
      // Mettre à jour le statut des messages
      updatedConversation.messages = updatedConversation.messages.map((msg: Message) => {
        if (msg.recipientId === this.authService.currentUser()?.id && !msg.isRead) {
          return { 
            ...msg, 
            isRead: true,
            readAt: new Date()
          };
        }
        return msg;
      });
      
      newConversations.set(userId, updatedConversation);
      return newConversations;
    });

    // Appeler l'API pour mettre à jour côté serveur
    return this.http.put<boolean>(`${this.apiUrl}/messages/${userId}/read`, {}, this.getHttpOptions()).pipe(
      catchError(error => {
        console.error('Erreur lors du marquage des messages comme lus:', error);
        return throwError(() => new Error('Impossible de marquer les messages comme lus'));
      })
    );
  }

  /**
   * Définit la conversation active
   */
  setActiveConversation(userId: number): void {
    this._activeConversationId.set(userId);
    
    // Charger la conversation si elle n'existe pas déjà
    if (!this._conversations().has(userId)) {
      this.getConversation(userId).subscribe({
        error: (err) => console.error('Erreur lors du chargement de la conversation:', err)
      });
    } else {
      // Marquer les messages comme lus
      this.markAsRead(userId).subscribe({
        error: (err) => console.error('Erreur lors du marquage des messages comme lus:', err)
      });
    }
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
