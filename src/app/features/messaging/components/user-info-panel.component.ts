import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessagingService } from '../../../core/services/messaging.service';
import { PipesModule } from '../../../shared/pipes/pipes.module';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-user-info-panel',
  standalone: true,
  imports: [CommonModule, PipesModule],
  template: `
    <div
      class="h-full bg-white border-l border-gray-200"
      *ngIf="activeConversation()"
    >
      <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="flex-shrink-0 p-6 border-b border-gray-200">
          <div class="text-center">
            <!-- Avatar grand -->
            <div class="relative mx-auto mb-4">
              <div
                class="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-medium mx-auto"
              >
                {{ getInitials() }}
              </div>
              <div
                class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white"
                [ngClass]="getStatusClass()"
              ></div>
            </div>

            <!-- Nom et statut -->
            <h3 class="text-xl font-semibold text-gray-900 mb-1">
              {{ getDisplayName() }}
            </h3>
            <p class="text-sm text-gray-500">{{ getUserStatus() }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ getLastSeenText() }}</p>
          </div>
        </div>

        <!-- Actions rapides -->
        <div class="flex-shrink-0 p-4 border-b border-gray-200">
          <div class="grid grid-cols-3 gap-2">
            <button
              class="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg
                class="w-6 h-6 text-gray-600 mb-1"
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
              <span class="text-xs text-gray-600">Appeler</span>
            </button>

            <button
              class="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg
                class="w-6 h-6 text-gray-600 mb-1"
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
              <span class="text-xs text-gray-600">Vidéo</span>
            </button>

            <button
              class="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg
                class="w-6 h-6 text-gray-600 mb-1"
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
              <span class="text-xs text-gray-600">Rechercher</span>
            </button>
          </div>
        </div>

        <!-- Informations détaillées -->
        <div class="flex-1 overflow-y-auto p-4 space-y-6">
          <!-- Informations de base -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3">Informations</h4>
            <div class="space-y-3">
              <div class="flex items-center space-x-3">
                <svg
                  class="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  ></path>
                </svg>
                <div>
                  <p class="text-sm text-gray-900">
                    {{ getParticipant()?.email }}
                  </p>
                  <p class="text-xs text-gray-500">Email</p>
                </div>
              </div>

              <div class="flex items-center space-x-3">
                <svg
                  class="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
                <div>
                  <p class="text-sm text-gray-900">
                    {{ getParticipant()?.username }}
                  </p>
                  <p class="text-xs text-gray-500">Nom d'utilisateur</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Statistiques de conversation -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3">Conversation</h4>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Messages échangés</span>
                <span class="text-sm font-medium text-gray-900">{{
                  getTotalMessages()
                }}</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Messages non lus</span>
                <span class="text-sm font-medium text-primary-600">{{
                  getUnreadCount()
                }}</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Dernière activité</span>
                <span class="text-sm text-gray-900">{{
                  getLastActivity() | timeAgo
                }}</span>
              </div>
            </div>
          </div>

          <!-- Médias partagés -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-medium text-gray-900">Médias partagés</h4>
              <button class="text-xs text-primary-600 hover:text-primary-500">
                Voir tout
              </button>
            </div>

            <div class="grid grid-cols-3 gap-2">
              <!-- Placeholder pour les médias -->
              <div
                *ngFor="let item of [1, 2, 3]"
                class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
            </div>

            <p class="text-xs text-gray-500 text-center mt-2">
              Aucun média partagé
            </p>
          </div>
        </div>

        <!-- Actions de conversation -->
        <div class="flex-shrink-0 p-4 border-t border-gray-200 space-y-2">
          <button
            (click)="toggleMute()"
            class="w-full flex items-center justify-center space-x-2 py-2 px-4 text-sm font-medium rounded-lg transition-colors"
            [class.text-gray-700]="!isMuted()"
            [class.hover:bg-gray-100]="!isMuted()"
            [class.text-orange-700]="isMuted()"
            [class.bg-orange-50]="isMuted()"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                *ngIf="!isMuted()"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              ></path>
              <path
                *ngIf="isMuted()"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              ></path>
            </svg>
            <span
              >{{ isMuted() ? 'Réactiver' : 'Couper' }} les notifications</span
            >
          </button>

          <button
            (click)="togglePin()"
            class="w-full flex items-center justify-center space-x-2 py-2 px-4 text-sm font-medium rounded-lg transition-colors"
            [class.text-gray-700]="!isPinned()"
            [class.hover:bg-gray-100]="!isPinned()"
            [class.text-primary-700]="isPinned()"
            [class.bg-primary-50]="isPinned()"
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
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              ></path>
            </svg>
            <span
              >{{ isPinned() ? 'Détacher' : 'Épingler' }} la conversation</span
            >
          </button>

          <button
            (click)="blockUser()"
            class="w-full flex items-center justify-center space-x-2 py-2 px-4 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
              ></path>
            </svg>
            <span>Bloquer l'utilisateur</span>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class UserInfoPanelComponent {
  private readonly messagingService = inject(MessagingService);

  // Data from service
  readonly activeConversation = this.messagingService.activeConversation;

  getParticipant() {
    return this.activeConversation()?.participant;
  }

  getInitials(): string {
    const participant = this.getParticipant();
    if (!participant) return '?';

    if (participant.firstName && participant.lastName) {
      return (participant.firstName[0] + participant.lastName[0]).toUpperCase();
    }
    return participant.username?.charAt(0).toUpperCase() || '?';
  }

  getDisplayName(): string {
    const participant = this.getParticipant();
    if (!participant) return 'Utilisateur inconnu';

    if (participant.firstName && participant.lastName) {
      return `${participant.firstName} ${participant.lastName}`;
    }
    return participant.username || 'Utilisateur inconnu';
  }

  getStatusClass(): string {
    const status = this.getParticipant()?.status;
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

  getUserStatus(): string {
    const participant = this.getParticipant();
    if (!participant) return '';

    switch (participant.status) {
      case 'online':
        return 'En ligne';
      case 'away':
        return 'Absent';
      case 'busy':
        return 'Occupé';
      case 'offline':
        return 'Hors ligne';
      default:
        return 'Statut inconnu';
    }
  }

  private readonly timeAgoPipe = inject(TimeAgoPipe);

  getLastSeenText(): string {
    const participant = this.getParticipant();
    if (!participant || participant.isOnline) return '';

    if (participant.lastSeen) {
      return `Vu pour la dernière fois ${this.timeAgoPipe.transform(participant.lastSeen)}`;
    }
    return '';
  }

  getTotalMessages(): number {
    return this.activeConversation()?.totalMessages || 0;
  }

  getUnreadCount(): number {
    return this.activeConversation()?.unreadCount || 0;
  }

  getLastActivity(): Date {
    return this.activeConversation()?.lastActivity || new Date();
  }

  isMuted(): boolean {
    return this.activeConversation()?.isMuted || false;
  }

  isPinned(): boolean {
    return this.activeConversation()?.isPinned || false;
  }

  toggleMute() {
    // TODO: Implement mute/unmute functionality
    console.log('Toggle mute');
  }

  togglePin() {
    // TODO: Implement pin/unpin functionality
    console.log('Toggle pin');
  }

  blockUser() {
    // TODO: Implement block user functionality
    const displayName = this.getDisplayName();
    if (confirm(`Êtes-vous sûr de vouloir bloquer ${displayName} ?`)) {
      console.log('Block user');
    }
  }
}
