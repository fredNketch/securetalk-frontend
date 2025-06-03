import { Component, inject, signal, output, computed, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagingService } from '../../../core/services/messaging.service';
import { UsersService } from '../../../core/services/users.service';
import { PipesModule } from '../../../shared/pipes/pipes.module';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { Conversation } from '../../../core/models/messaging.models';

@Component({
  selector: 'app-conversations-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PipesModule],
  template: `
    <div class="h-full flex flex-col bg-white">
      <!-- Header avec recherche -->
      <div class="flex-shrink-0 p-4 border-b border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Messages</h2>
          <button
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            (click)="startNewConversation()"
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
          </button>
        </div>

        <!-- Barre de recherche -->
        <div class="relative">
          <input
            type="text"
            placeholder="Rechercher des conversations..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
          <svg
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
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
        </div>
      </div>

      <!-- Liste des conversations -->
      <div class="flex-1 overflow-y-auto scrollbar-thin">
        <div *ngIf="loading()" class="p-4 space-y-4">
          <!-- Skeleton loading -->
          <div *ngFor="let item of [1, 2, 3, 4, 5]" class="animate-pulse">
            <div class="flex items-center space-x-3 p-3">
              <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!loading()" class="divide-y divide-gray-100">
          <div
            *ngFor="
              let conversation of filteredConversations();
              trackBy: trackByConversation
            "
            class="relative p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            [class.bg-primary-50]="isActiveConversation(conversation)"
            [class.border-r-2]="isActiveConversation(conversation)"
            [class.border-primary-500]="isActiveConversation(conversation)"
            (click)="selectConversation(conversation)"
          >
            <!-- Pin indicator -->
            <div
              *ngIf="conversation.isPinned"
              class="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full"
            ></div>

            <div class="flex items-start space-x-3">
              <!-- Avatar avec statut -->
              <div class="relative flex-shrink-0">
                <div
                  class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium"
                >
                  {{ getInitials(conversation.participant) }}
                </div>

                <!-- Indicateur de statut -->
                <div
                  class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                  [ngClass]="getStatusClass(conversation.participant.status)"
                ></div>

                <!-- Indicateur de frappe -->
                <div
                  *ngIf="isTyping(conversation.participant.id)"
                  class="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"
                ></div>
              </div>

              <!-- Contenu de la conversation -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <h3 class="text-sm font-medium text-gray-900 truncate">
                      {{ getDisplayName(conversation.participant) }}
                    </h3>

                    <!-- Icônes d'état -->
                    <div class="flex items-center space-x-1">
                      <svg
                        *ngIf="conversation.isMuted"
                        class="w-3 h-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                        ></path>
                      </svg>

                      <svg
                        *ngIf="conversation.isPinned"
                        class="w-3 h-3 text-primary-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        ></path>
                      </svg>
                    </div>
                  </div>

                  <!-- Timestamp -->
                  <div class="flex items-center space-x-2">
                    <span class="text-xs text-gray-500">
                      {{ conversation.lastMessage?.timestamp | timeAgo }}
                    </span>

                    <!-- Badge de messages non lus -->
                    <span
                      *ngIf="conversation.unreadCount > 0"
                      class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-500 rounded-full min-w-[1.25rem] h-5"
                    >
                      {{
                        conversation.unreadCount > 99
                          ? '99+'
                          : conversation.unreadCount
                      }}
                    </span>
                  </div>
                </div>

                <!-- Dernier message -->
                <div class="mt-1 flex items-center">
                  <p class="text-sm text-gray-600 truncate flex-1">
                    <span
                      *ngIf="isLastMessageFromMe(conversation)"
                      class="text-gray-400"
                      >Vous:
                    </span>
                    {{ conversation.lastMessage?.content || 'Aucun message' }}
                  </p>

                  <!-- Indicateur de message lu -->
                  <div
                    *ngIf="isLastMessageFromMe(conversation)"
                    class="ml-2 flex-shrink-0"
                  >
                    <svg
                      *ngIf="conversation.lastMessage?.isRead"
                      class="w-4 h-4 text-primary-500"
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
                      *ngIf="!conversation.lastMessage?.isRead"
                      class="w-4 h-4 text-gray-400"
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
              </div>
            </div>
          </div>
        </div>

        <!-- État vide -->
        <div
          *ngIf="!loading() && filteredConversations().length === 0"
          class="flex flex-col items-center justify-center py-12 px-4"
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
            {{ searchQuery() ? 'Aucun résultat' : 'Aucune conversation' }}
          </h3>
          <p class="text-gray-500 text-center">
            {{ searchQuery() ? 'Essayez avec d'autres mots-clés' : 'Commencez une nouvelle conversation pour débuter' }}
          </p>
          <button
            *ngIf="!searchQuery()"
            class="btn-primary mt-4"
            (click)="startNewConversation()"
          >
            Nouvelle conversation
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConversationsListComponent {
  private readonly messagingService = inject(MessagingService);
  private readonly usersService = inject(UsersService);

  // Output events
  conversationSelected = output<Conversation>();
  @Output() newConversation = new EventEmitter<void>();

  // Local state
  searchQuery = signal('');

  // Data from service
  readonly loading = this.messagingService.loading;
  readonly conversations = this.messagingService.conversations;
  readonly filteredConversations = this.messagingService.filteredConversations;
  readonly activeConversation = this.messagingService.activeConversation;
  readonly typingUsers = this.messagingService.typingUsers;

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.messagingService.searchConversations(query);
  }

  selectConversation(conversation: Conversation): void {
    this.messagingService.selectConversation(conversation);
    this.conversationSelected.emit(conversation);
  }

  isActiveConversation(conversation: Conversation): boolean {
    return this.activeConversation()?.id === conversation.id;
  }

  isLastMessageFromMe(conversation: Conversation): boolean {
    const currentUserId = 1; // TODO: Get from AuthService
    return conversation.lastMessage?.senderId === currentUserId;
  }

  isTyping(userId: number): boolean {
    return this.typingUsers().some((typing) => typing.userId === userId);
  }

  getInitials(user: any): string {
    if (user.firstName && user.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    return user.username?.charAt(0).toUpperCase() || '?';
  }

  getDisplayName(user: any): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || 'Utilisateur inconnu';
  }

  getStatusClass(status: string): string {
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

  trackByConversation(index: number, conversation: Conversation): number {
    return conversation.id;
  }

  startNewConversation(): void {
    // Émettre l'événement pour que le composant parent ouvre le modal
    this.newConversation.emit();
  }
}
