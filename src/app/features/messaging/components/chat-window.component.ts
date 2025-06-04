import {
  Component,
  inject,
  signal,
  input,
  output,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  OnInit,
  OnDestroy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessagingService } from '../../../core/services/messaging.service';
import {
  WebSocketService,
  WebSocketMessage,
} from '../../../core/services/websocket.service';
import { AuthService } from '../../../core/auth/auth.service';
import { MessageInputComponent } from './message-input.component';
import { PipesModule } from '../../../shared/pipes/pipes.module';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { Message } from '../../../core/models/messaging.models';
import { EncryptionStatus } from '../../../core/models/message.model';

interface MessageGroup {
  id: string;
  senderId: number;
  messages: Message[];
  date: Date;
  lastTimestamp: Date;
  showDateSeparator: boolean;
}

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, MessageInputComponent, PipesModule],
  template: `
    <div class="h-full flex flex-col bg-white" *ngIf="activeConversation()">
      <!-- Header du chat -->
      <div class="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <!-- Bouton retour (mobile) -->
            <button
              *ngIf="showBackButton()"
              (click)="onBackClick()"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
            </button>

            <!-- Avatar et infos utilisateur -->
            <div class="relative">
              <div
                class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium"
              >
                {{ getInitials() }}
              </div>
              <div
                class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                [ngClass]="getStatusClass()"
              ></div>
            </div>

            <div>
              <h3 class="text-lg font-medium text-gray-900">
                {{ getDisplayName() }}
              </h3>
              <div class="flex items-center space-x-2">
                <p class="text-sm text-gray-500">
                  {{ getStatusText() }}
                </p>

                <!-- Indicateur de frappe -->
                <div
                  *ngIf="isTyping()"
                  class="flex items-center space-x-1 text-primary-500"
                >
                  <span class="text-sm">tape...</span>
                  <div class="flex space-x-1">
                    <div
                      class="w-1 h-1 bg-current rounded-full animate-bounce"
                      style="animation-delay: 0ms"
                    ></div>
                    <div
                      class="w-1 h-1 bg-current rounded-full animate-bounce"
                      style="animation-delay: 150ms"
                    ></div>
                    <div
                      class="w-1 h-1 bg-current rounded-full animate-bounce"
                      style="animation-delay: 300ms"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions du chat -->
          <div class="flex items-center space-x-2">
            <button
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Rechercher dans la conversation"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </button>

            <button
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Appel vocal"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                ></path>
              </svg>
            </button>

            <button
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Appel vidéo"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                ></path>
              </svg>
            </button>

            <button
              (click)="toggleUserInfo()"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Informations utilisateur"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Zone des messages -->
      <div
        class="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        #messagesContainer
        [class.opacity-50]="loading()"
      >
        <!-- Loading messages -->
        <div *ngIf="loading()" class="space-y-4">
          <div *ngFor="let item of [1, 2, 3]" class="animate-pulse">
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Messages groupés -->
        <div *ngIf="!loading()" class="space-y-6">
          <div
            *ngFor="let group of messageGroups(); trackBy: trackByGroup"
            class="space-y-1"
          >
            <!-- Séparateur de date -->
            <div
              *ngIf="group.showDateSeparator"
              class="flex items-center justify-center py-2"
            >
              <span
                class="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full"
              >
                {{ formatDateSeparator(group.date) }}
              </span>
            </div>

            <!-- Messages du groupe -->
            <div class="space-y-1">
              <div
                *ngFor="let message of group.messages; trackBy: trackByMessage"
                class="flex items-end space-x-2"
                [class.flex-row-reverse]="isMyMessage(message)"
                [class.justify-end]="isMyMessage(message)"
              >
                <!-- Avatar (seulement pour le dernier message du groupe des autres) -->
                <div
                  *ngIf="!isMyMessage(message) && isLastInGroup(message, group)"
                  class="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                >
                  {{ getInitials() }}
                </div>
                <div
                  *ngIf="
                    !isMyMessage(message) && !isLastInGroup(message, group)
                  "
                  class="w-6 h-6 flex-shrink-0"
                ></div>

                <!-- Bulle de message -->
                <div
                  class="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl relative group"
                  [ngClass]="getMessageBubbleClass(message)"
                >
                  <!-- Contenu du message -->
                  <div>
                    <!-- Message normalement déchiffré -->
                    <p
                      *ngIf="!hasEncryptionError(message)"
                      class="text-sm break-words whitespace-pre-wrap"
                    >
                      {{ message.content }}
                    </p>

                    <!-- Message avec erreur de déchiffrement -->
                    <div
                      *ngIf="hasEncryptionError(message)"
                      class="text-sm break-words whitespace-pre-wrap"
                    >
                      <div
                        class="flex items-center space-x-1 text-red-500 mb-1"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          ></path>
                        </svg>
                        <span>Message chiffré</span>
                      </div>
                      <p class="italic text-gray-600">{{ message.content }}</p>
                    </div>
                  </div>

                  <!-- Timestamp et statut -->
                  <div class="flex items-center justify-end space-x-1 mt-1">
                    <span class="text-xs opacity-70">
                      {{ message.timestamp | timeAgo }}
                    </span>

                    <!-- Statut de lecture (messages envoyés) -->
                    <div *ngIf="isMyMessage(message)" class="flex-shrink-0">
                      <svg
                        *ngIf="message.isRead"
                        class="w-3 h-3 opacity-70"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      <svg
                        *ngIf="!message.isRead"
                        class="w-3 h-3 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </div>
                  </div>

                  <!-- Actions du message (au survol) -->
                  <div
                    class="absolute top-0 right-0 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <div
                      class="flex items-center space-x-1 bg-white shadow-lg rounded-lg px-2 py-1"
                    >
                      <button
                        class="p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <svg
                          class="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          ></path>
                        </svg>
                      </button>
                      <button
                        class="p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <svg
                          class="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          ></path>
                        </svg>
                      </button>
                      <button
                        *ngIf="isMyMessage(message)"
                        class="p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <svg
                          class="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- État vide -->
        <div
          *ngIf="!loading() && messages().length === 0"
          class="flex flex-col items-center justify-center py-12"
        >
          <div
            class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"
          >
            <svg
              class="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              ></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Commencez la conversation
          </h3>
          <p class="text-gray-500 text-center">
            Envoyez votre premier message à {{ getDisplayName() }}
          </p>
        </div>
      </div>

      <!-- Zone de saisie -->
      <div class="flex-shrink-0 border-t border-gray-200 bg-white">
        <app-message-input
          [disabled]="loading()"
          (messageSent)="onMessageSent($event)"
          (typing)="onTyping()"
          (stopTyping)="onStopTyping()"
        >
        </app-message-input>
      </div>
    </div>

    <!-- État aucune conversation sélectionnée -->
    <div
      *ngIf="!activeConversation()"
      class="h-full flex items-center justify-center bg-gray-50"
    >
      <div class="text-center">
        <div
          class="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center"
        >
          <svg
            class="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            ></path>
          </svg>
        </div>
        <h3 class="text-xl font-medium text-gray-900 mb-2">
          Sélectionnez une conversation
        </h3>
        <p class="text-gray-500">
          Choisissez une conversation pour commencer à discuter
        </p>
      </div>
    </div>
  `,
})
export class ChatWindowComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  private readonly messagingService = inject(MessagingService);
  private readonly authService = inject(AuthService);
  private readonly timeAgoPipe = inject(TimeAgoPipe);
  private readonly websocketService = inject(WebSocketService);
  private websocketSubscription: any = null;

  @ViewChild('messagesContainer') messagesContainer?: ElementRef;

  // Inputs et outputs
  readonly showBackButton = input<boolean>(false);
  readonly backClicked = output<void>();

  // Signals du service
  readonly activeConversation = this.messagingService.activeConversation;
  readonly messages = this.messagingService.messages;
  readonly loading = this.messagingService.loading;
  readonly typingUsers = this.messagingService.typingUsers;
  readonly currentUser = this.authService.currentUser;

  // Signals locaux
  readonly shouldScrollToBottom = signal(false);

  ngOnInit() {
    // Abonnement WebSocket pour messages temps réel
    this.websocketSubscription = this.websocketService.messages$.subscribe(
      (msg: WebSocketMessage) => {
        if (msg.type === 'message') {
          const activeConv = this.activeConversation();
          // Vérifie si le message concerne la conversation active
          if (
            activeConv &&
            (msg.data.senderId === activeConv.participant.id ||
              msg.data.recipientId === activeConv.participant.id)
          ) {
            // Ajoute le message à la liste des messages
            this.messagingService.addMessage(msg.data);
            setTimeout(() => this.shouldScrollToBottom.set(true), 100);
          }
        }
      },
    );
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom()) {
      this.scrollToBottom();
      this.shouldScrollToBottom.set(false);
    }
  }

  ngOnDestroy() {
    // Cleanup typing indicators
    const conv = this.activeConversation();
    if (conv) {
      this.messagingService.stopTyping(conv.id);
    }
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
      this.websocketSubscription = null;
    }
  }

  onBackClick() {
    this.backClicked.emit();
  }

  onMessageSent(content: string) {
    const conversation = this.activeConversation();
    if (!conversation) return;

    console.log('Envoi de message depuis ChatWindowComponent');
    this.messagingService
      .sendMessage({
        recipientId: conversation.participant.id,
        content,
      })
      .subscribe({
        next: (newMessage) => {
          console.log(
            'Message reçu dans le composant après envoi:',
            newMessage,
          );
          // S'assurer que le message est bien dans la liste avant de scroller
          setTimeout(() => this.shouldScrollToBottom.set(true), 100);
        },
        error: (error) => {
          console.error(
            "Erreur lors de l'envoi du message depuis le composant:",
            error,
          );
        },
      });
  }

  onTyping() {
    const conversation = this.activeConversation();
    if (conversation) {
      this.messagingService.startTyping(conversation.id);
    }
  }

  onStopTyping() {
    const conversation = this.activeConversation();
    if (conversation) {
      this.messagingService.stopTyping(conversation.id);
    }
  }

  toggleUserInfo() {
    // TODO: Emit event to parent component
    console.log('Toggle user info panel');
  }

  private scrollToBottom() {
    try {
      const container = this.messagesContainer?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  // Helper methods
  isMyMessage(message: Message): boolean {
    return message.senderId === this.currentUser()?.id;
  }

  isReceivedMessage(message: Message): boolean {
    return message.senderId !== this.authService.currentUser()?.id;
  }

  hasEncryptionError(message: Message): boolean {
    return (
      !!message.encryptionStatus &&
      message.encryptionStatus !== EncryptionStatus.OK
    );
  }

  getInitials(): string {
    const participant = this.activeConversation()?.participant;
    if (!participant) return '?';

    if (participant.firstName && participant.lastName) {
      return (participant.firstName[0] + participant.lastName[0]).toUpperCase();
    }
    return participant.username?.charAt(0).toUpperCase() || '?';
  }

  getDisplayName(): string {
    const participant = this.activeConversation()?.participant;
    if (!participant) return 'Utilisateur inconnu';

    if (participant.firstName && participant.lastName) {
      return `${participant.firstName} ${participant.lastName}`;
    }
    return participant.username || 'Utilisateur inconnu';
  }

  getStatusClass(): string {
    const status = this.activeConversation()?.participant.status;
    switch (status) {
      case 'online':
        return 'bg-green-400';
      case 'away':
        return 'bg-yellow-400';
      case 'busy':
        return 'bg-red-400';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  }

  getStatusText(): string {
    const participant = this.activeConversation()?.participant;
    if (!participant) return '';

    if (participant.isOnline) {
      switch (participant.status) {
        case 'online':
          return 'En ligne';
        case 'away':
          return 'Absent';
        case 'busy':
          return 'Occupé';
        default:
          return 'En ligne';
      }
    } else {
      const lastSeen = participant.lastSeen;
      if (lastSeen) {
        return `Vu ${this.timeAgoPipe.transform(lastSeen)}`;
      }
      return 'Hors ligne';
    }
  }

  isTyping(): boolean {
    const participantId = this.activeConversation()?.participant.id;
    if (!participantId) return false;

    return this.typingUsers().some((typing) => typing.userId === participantId);
  }

  getMessageBubbleClass(message: Message): string {
    const isMyMsg = this.isMyMessage(message);
    const baseClasses = 'rounded-2xl shadow-sm';

    if (isMyMsg) {
      return `${baseClasses} bg-primary-500 text-white ml-auto rounded-br-sm`;
    } else {
      return `${baseClasses} bg-gray-100 text-gray-900 mr-auto rounded-bl-sm`;
    }
  }

  messageGroups = computed(() => {
    const messages = this.messages();
    if (!messages.length) return [];

    const groups: MessageGroup[] = [];
    let currentGroup: MessageGroup | null = null;
    let lastDate: string | null = null;

    messages.forEach((message, index) => {
      const messageDate = new Date(message.timestamp);
      const dateKey = messageDate.toDateString();
      const showDateSeparator = dateKey !== lastDate;

      // Créer un nouveau groupe si nécessaire
      if (
        !currentGroup ||
        currentGroup.senderId !== message.senderId ||
        showDateSeparator ||
        this.shouldCreateNewGroup(currentGroup.lastTimestamp, message.timestamp)
      ) {
        currentGroup = {
          id: `group-${groups.length}`,
          senderId: message.senderId,
          messages: [],
          date: messageDate,
          lastTimestamp: message.timestamp,
          showDateSeparator,
        };
        groups.push(currentGroup);
      }

      currentGroup.messages.push(message);
      currentGroup.lastTimestamp = message.timestamp;
      lastDate = dateKey;
    });

    return groups;
  });

  private shouldCreateNewGroup(
    lastTimestamp: Date,
    currentTimestamp: Date,
  ): boolean {
    const timeDiff = currentTimestamp.getTime() - lastTimestamp.getTime();
    return timeDiff > 5 * 60 * 1000; // 5 minutes
  }

  isLastInGroup(message: Message, group: MessageGroup): boolean {
    return group.messages[group.messages.length - 1].id === message.id;
  }

  formatDateSeparator(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(date);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return messageDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year:
          messageDate.getFullYear() !== today.getFullYear()
            ? 'numeric'
            : undefined,
      });
    }
  }

  trackByGroup(index: number, group: MessageGroup): string {
    return group.id;
  }

  trackByMessage(index: number, message: Message): number {
    return message.id;
  }
}
