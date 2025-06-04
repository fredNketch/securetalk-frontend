import { Injectable, signal, computed, inject, OnDestroy, effect } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, catchError, map, tap, interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Message, Conversation, UserInfo, SendMessageRequest, TypingIndicator } from '../models/messaging.models';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MessagingService implements OnDestroy {
  private readonly apiUrl = 'https://localhost:8443/api';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Signals pour l'état de la messagerie
  private readonly _conversations = signal<Conversation[]>([]);
  private readonly _activeConversation = signal<Conversation | null>(null);
  private readonly _messages = signal<Message[]>([]);
  private readonly _typingUsers = signal<TypingIndicator[]>([]);
  private readonly _loading = signal(false);
  private readonly _searchQuery = signal('');
  private messageCache = new Map<number, Message[]>();
  private conversationCache = new Map<number, Conversation>();
  private destroy$ = new Subject<void>();

  // Computed values publics
  readonly conversations = this._conversations.asReadonly();
  readonly activeConversation = this._activeConversation.asReadonly();
  readonly messages = this._messages.asReadonly();
  readonly typingUsers = this._typingUsers.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();

  readonly unreadCount = computed(() => {
    return this._conversations().reduce(
      (count, conv) => count + (conv.unreadCount || 0),
      0
    );
  });

  readonly filteredConversations = computed(() => {
    const query = this._searchQuery().toLowerCase();
    if (!query) return this._conversations();

    return this._conversations().filter(
      (conv) =>
        conv.participant?.username?.toLowerCase().includes(query) ||
        conv.participant?.firstName?.toLowerCase().includes(query) ||
        conv.participant?.lastName?.toLowerCase().includes(query) ||
        conv.lastMessage?.content?.toLowerCase().includes(query)
    );
  });

  constructor() {
    this.initializeWebSocket();
    this.startTypingCleanup();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeWebSocket(): void {
    // Use effect to react to currentUser changes
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        // Réinitialiser le cache lors d'une nouvelle connexion
        this.messageCache.clear();
        this.conversationCache.clear();
      }
    });
  }

  /**
   * Ajoute un message à la liste des messages courants et met à jour le cache
   */
  public addMessage(message: Message): void {
    const currentMessages = this._messages();
    
    // Vérifier si le message existe déjà pour éviter les doublons
    if (!currentMessages.some(m => m.id === message.id)) {
      this._messages.set([...currentMessages, message]);
      
      // Mettre à jour le cache des messages pour cette conversation
      const conversationId = message.conversationId || this._activeConversation()?.id;
      if (conversationId) {
        const cachedMessages = this.messageCache.get(conversationId) || [];
        this.messageCache.set(conversationId, [...cachedMessages, message]);
        this.updateConversationLastActivity(conversationId, message.timestamp);
      }
    }
  }
  
  /**
   * Met à jour la dernière activité d'une conversation
   */
  private updateConversationLastActivity(conversationId: number, timestamp: Date): void {
    const conversations = this._conversations();
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return { ...conv, lastActivity: timestamp };
      }
      return conv;
    });
    this._conversations.set(updatedConversations);
  }

  /**
   * Récupère les options HTTP avec le token d'authentification
   */
  private getHttpOptions(): { headers: HttpHeaders } {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }


  // Charger les conversations avec mise en cache
  loadConversations(forceRefresh: boolean = false): Observable<Conversation[]> {
    // Retourner les données en cache si disponibles et pas de forçage du rafraîchissement
    const cachedConversations = this._conversations();
    if (cachedConversations.length > 0 && !forceRefresh) {
      return of(cachedConversations);
    }

    this._loading.set(true);

    return this.http.get<Conversation[]>(`${this.apiUrl}/messages/conversations`, this.getHttpOptions()).pipe(
      map(conversations => {
        // Mettre à jour le cache des conversations
        conversations.forEach(conv => {
          this.conversationCache.set(conv.id, conv);
        });
        return conversations;
      }),
      tap(conversations => {
        this._conversations.set(conversations);
        this._loading.set(false);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur lors du chargement des conversations:', error);
        this._loading.set(false);
        return throwError(() => new Error('Impossible de charger les conversations'));
      })
    );
  }

  // Charger les messages d'une conversation
  loadMessages(conversationId: number): Observable<Message[]> {
    this._loading.set(true);
    
    // Trouver la conversation dans la liste pour obtenir l'ID de l'utilisateur participant
    const conversation = this._conversations().find(c => c.id === conversationId);
    
    if (!conversation) {
      console.error(`Conversation avec ID ${conversationId} non trouvée`);
      this._loading.set(false);
      return of([]);
    }
    
    // Utiliser l'ID de l'utilisateur participant à la conversation au lieu de l'ID de la conversation
    const participantId = conversation.participant.id;
    console.log(`Chargement des messages pour la conversation avec l'utilisateur ID: ${participantId}`);
    
    return this.http.get<any[]>(`${this.apiUrl}/messages/conversation/${participantId}`, this.getHttpOptions()).pipe(
      map(messagesData => {
        // Log pour débogage
        console.log('Données brutes des messages reçues:', messagesData);
        
        // Transformer et valider les données reçues
        const messages = messagesData.map(msg => {
          // Convertir les dates et s'assurer que toutes les propriétés requises sont présentes
          const message: Message = {
            id: msg.id || 0,
            content: msg.content || '',
            senderId: msg.senderId || 0,
            recipientId: msg.recipientId || 0,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            isRead: msg.status === 'READ',
            readAt: msg.status === 'READ' ? new Date(msg.timestamp) : undefined,
            isEdited: false,
            editedAt: undefined,
            messageType: msg.messageType || 'text',
            replyTo: undefined,
            reactions: []
          };
          return message;
        });
        
        console.log('Messages transformés:', messages);
        this._messages.set(messages);
        this._loading.set(false);
        
        // Marquer les messages comme lus
        this.markMessagesAsRead(conversationId);
        
        return messages;
      }),
      catchError(error => {
        this._loading.set(false);
        console.error('Erreur lors du chargement des messages:', error);
        console.error('Détails de l\'erreur:', error.error);
        // Retourner un tableau vide plutôt que de lancer une erreur
        // pour éviter de bloquer l'interface utilisateur
        return of([]);
      })
    );
  }

  // Envoyer un message
  sendMessage(request: SendMessageRequest): Observable<Message> {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      return throwError(() => new Error('Utilisateur non connecté'));
    }

    // Valider les données requises
    if (!request.recipientId) {
      console.error('Erreur: recipientId manquant dans la requête');
      return throwError(() => new Error('ID du destinataire manquant'));
    }
    
    if (!request.content || request.content.trim() === '') {
      console.error('Erreur: contenu du message vide');
      return throwError(() => new Error('Le contenu du message ne peut pas être vide'));
    }

    // Préparer le message pour l'API - s'assurer que tous les champs sont du bon type
    const messageRequest = {
      recipientId: Number(request.recipientId), // S'assurer que c'est bien un nombre
      content: request.content.trim(),
      messageType: request.messageType || 'text',
      replyTo: request.replyTo ? Number(request.replyTo) : null // S'assurer que c'est bien un nombre ou null
    };

    // Logs de débogage
    console.log('Envoi de message:', JSON.stringify(messageRequest));

    // Ajouter explicitement les headers d'authentification
    return this.http.post<any>(`${this.apiUrl}/messages`, messageRequest, this.authService.getHttpOptions()).pipe(
      tap(response => {
        console.log('Réponse du serveur après envoi:', response);
      }),
      map(response => {
        // Vérifier que la réponse contient les données attendues
        if (!response || !response.id) {
          console.warn('Réponse du serveur incomplète:', response);
        }
        
        // Convertir le MessageDto du backend en Message pour le frontend
        const message: Message = {
          id: response.id || 0,
          content: response.content || '',
          senderId: response.senderId || currentUser.id,
          recipientId: response.recipientId || Number(request.recipientId),
          timestamp: response.timestamp ? new Date(response.timestamp) : new Date(),
          isRead: response.status === 'READ',
          readAt: response.status === 'READ' ? new Date(response.timestamp) : undefined,
          isEdited: false,
          editedAt: undefined,
          messageType: response.messageType || 'text',
          replyTo: undefined,
          reactions: []
        };
        return message;
      }),
      tap(newMessage => {
        console.log('Message transformé pour le frontend:', newMessage);
        // Ajouter le message à la liste
        this._messages.update((messages) => [...messages, newMessage]);

        // Mettre à jour la conversation
        this.updateConversationWithNewMessage(newMessage);
      }),
      catchError(error => {
        console.error('Erreur lors de l\'envoi du message:', error);
        console.error('Détails de l\'erreur:', error.error);
        return throwError(() => new Error(`Impossible d'envoyer le message: ${error.error?.message || error.message || 'Erreur inconnue'}`));
      })
    );
  }

  // Sélectionner une conversation active
  selectConversation(conversation: Conversation): void {
    console.log(`Sélection de la conversation avec ${conversation.participant.username} (ID: ${conversation.id})`);
    this._activeConversation.set(conversation);
    
    // Vérifier que l'ID de conversation est valide
    if (conversation.id <= 0) {
      console.warn('ID de conversation invalide, impossible de charger les messages');
      this._messages.set([]);
      return;
    }
    
    // Charger les messages et gérer les erreurs
    this.loadMessages(conversation.id).subscribe({
      next: (messages) => {
        console.log(`${messages.length} messages chargés pour la conversation avec ${conversation.participant.username}`);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des messages:', err);
        this._messages.set([]);
      }
    });
  }
  
  // Démarrer une nouvelle conversation avec un utilisateur
  startConversationWithUser(user: any): void {
    // Vérifier si une conversation existe déjà avec cet utilisateur
    const existingConversation = this._conversations().find(c => 
      c.participant.id === user.id
    );
    
    if (existingConversation) {
      // Si la conversation existe, la sélectionner
      this.selectConversation(existingConversation);
    } else {
      // Sinon, créer une nouvelle conversation
      const currentUser = this.authService.currentUser();
      if (!currentUser) return;
      
      // Créer une conversation temporaire
      const newConversation: Conversation = {
        id: -1, // ID temporaire, sera remplacé par l'ID réel après le premier message
        participant: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isOnline: user.online || false,
          status: user.status || 'offline'
        },
        lastActivity: new Date(),
        unreadCount: 0,
        lastMessage: undefined,
        totalMessages: 0,
        isBlocked: false,
        isPinned: false,
        isMuted: false
      };
      
      // Ajouter la conversation à la liste et la sélectionner
      this._conversations.update(conversations => [newConversation, ...conversations]);
      this._activeConversation.set(newConversation);
      this._messages.set([]);
    }
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

    // Appel API pour mettre à jour côté serveur avec les bons headers d'authentification
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
    interval(5000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const now = new Date();
        this._typingUsers.update((users) =>
          users.filter((user) => now.getTime() - user.timestamp.getTime() < 5000)
        );
      });
  }
}
