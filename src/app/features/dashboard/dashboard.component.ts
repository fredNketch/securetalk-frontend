import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import {
  DashboardService,
  DashboardStats,
  RecentActivity,
  QuickAction,
} from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Bonjour {{ currentUser()?.firstName || currentUser()?.username }}! 👋
        </h1>
        <p class="text-gray-600">
          Voici un résumé de votre activité sur SecureTalk
        </p>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          *ngFor="let action of quickActions()"
          [routerLink]="action.route"
          class="card p-6 hover:shadow-md transition-all duration-200 text-left group"
        >
          <div class="flex items-center">
            <div
              class="w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
              [ngClass]="
                'bg-' +
                action.color +
                '-100 group-hover:bg-' +
                action.color +
                '-200'
              "
            >
              <svg
                class="w-6 h-6 transition-colors"
                [ngClass]="'text-' + action.color + '-600'"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  [attr.d]="getIconPath(action.icon)"
                ></path>
              </svg>
            </div>
            <div class="ml-4 flex-1">
              <div class="flex items-center justify-between">
                <h3 class="font-medium text-gray-900">{{ action.title }}</h3>
                <span
                  *ngIf="action.badge"
                  class="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full"
                >
                  {{ action.badge }}
                </span>
              </div>
              <p class="text-sm text-gray-500 mt-1">{{ action.description }}</p>
            </div>
          </div>
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card p-6">
          <div class="flex items-center">
            <div
              class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-blue-600"
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
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">Messages totaux</h3>
              <div class="flex items-baseline">
                <p class="text-2xl font-semibold text-gray-900">
                  {{ stats()?.totalMessages || 0 | number }}
                </p>
                <span class="ml-2 text-sm font-medium text-green-600"
                  >+12%</span
                >
              </div>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center">
            <div
              class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707-.293l-2.414-2.414A1 1 0 0016 10h-2V6a2 2 0 00-2-2h-4a2 2 0 00-2 2v4h-2a1 1 0 00-.707.293L1.707 12.707A1 1 0 001 13.414V18a2 2 0 002 2h14a2 2 0 002-2z"
                ></path>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">
                Messages non lus
              </h3>
              <div class="flex items-baseline">
                <p class="text-2xl font-semibold text-gray-900">
                  {{ stats()?.unreadMessages || 0 }}
                </p>
                <span
                  *ngIf="(stats()?.unreadMessages || 0) > 0"
                  class="ml-2 text-sm font-medium text-red-600"
                  >Nouveau!</span
                >
              </div>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center">
            <div
              class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">
                Conversations actives
              </h3>
              <div class="flex items-baseline">
                <p class="text-2xl font-semibold text-gray-900">
                  {{ stats()?.activeConversations || 0 }}
                </p>
                <span class="ml-2 text-sm font-medium text-blue-600"
                  >{{ stats()?.onlineUsers || 0 }} en ligne</span
                >
              </div>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center">
            <div
              class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-purple-600"
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
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">
                Utilisateurs en ligne
              </h3>
              <div class="flex items-baseline">
                <p class="text-2xl font-semibold text-gray-900">
                  {{ stats()?.onlineUsers || 0 }}
                </p>
                <span class="ml-2 text-sm font-medium text-green-600"
                  >Maintenant</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Activity Feed -->
        <div class="card">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">
                Activité récente
              </h3>
              <button
                routerLink="/messages"
                class="text-sm text-primary-600 hover:text-primary-500 font-medium transition-colors"
              >
                Voir tout
              </button>
            </div>
          </div>
          <div class="p-6">
            <div *ngIf="loading()" class="space-y-4">
              <div *ngFor="let item of [1, 2, 3]" class="animate-pulse">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="!loading()" class="space-y-4">
              <div
                *ngFor="let activity of recentActivity()"
                class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <!-- Avatar -->
                <div
                  class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                >
                  {{ activity.user.charAt(0).toUpperCase() }}
                </div>

                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-900">
                    <span class="font-medium">{{ activity.user }}</span>
                    <span class="text-gray-600">
                      {{ activity.description }}</span
                    >
                  </p>
                  <div class="flex items-center mt-1">
                    <span class="text-xs text-gray-500">
                      {{ formatTime(activity.timestamp) }}
                    </span>
                    <span
                      class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      [ngClass]="getActivityBadgeClass(activity.type)"
                    >
                      {{ getActivityLabel(activity.type) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              *ngIf="!loading() && recentActivity().length === 0"
              class="text-center py-8"
            >
              <svg
                class="mx-auto h-12 w-12 text-gray-300"
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
              <p class="text-gray-500 text-sm mt-2">Aucune activité récente</p>
              <button
                routerLink="/messages"
                class="mt-2 text-primary-600 hover:text-primary-500 text-sm font-medium"
              >
                Commencer une conversation
              </button>
            </div>
          </div>
        </div>

        <!-- Messages Chart -->
        <div class="card">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
              Statistiques des messages
            </h3>
          </div>
          <div class="p-6">
            <div class="space-y-6">
              <!-- Messages envoyés -->
              <div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Messages envoyés</span>
                  <span class="font-medium">{{
                    stats()?.messagesSent || 0
                  }}</span>
                </div>
                <div class="mt-2 bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    [style.width.%]="getSentPercentage()"
                  ></div>
                </div>
              </div>

              <!-- Messages reçus -->
              <div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Messages reçus</span>
                  <span class="font-medium">{{
                    stats()?.messagesReceived || 0
                  }}</span>
                </div>
                <div class="mt-2 bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-green-500 h-2 rounded-full transition-all duration-500"
                    [style.width.%]="getReceivedPercentage()"
                  ></div>
                </div>
              </div>

              <!-- Ratio -->
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-center">
                  <p class="text-sm text-gray-600">Ratio envoyés/reçus</p>
                  <p class="text-2xl font-bold text-primary-600 mt-1">
                    {{ getMessageRatio() }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  // Signals
  readonly currentUser = this.authService.currentUser;
  readonly loading = signal(true);
  readonly stats = signal<DashboardStats | null>(null);
  readonly recentActivity = signal<RecentActivity[]>([]);
  readonly quickActions = signal<QuickAction[]>([]);

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.loading.set(true);

    // Charger les statistiques
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.loading.set(false);
      },
    });

    // Charger l'activité récente
    this.dashboardService.getRecentActivity().subscribe({
      next: (activity) => {
        this.recentActivity.set(activity);
      },
      error: (error) => {
        console.error("Erreur lors du chargement de l'activité:", error);
      },
    });

    // Charger les actions rapides
    this.quickActions.set(this.dashboardService.getQuickActions());
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    return `${days}j`;
  }

  getActivityBadgeClass(type: string): string {
    switch (type) {
      case 'message':
        return 'bg-blue-100 text-blue-800';
      case 'user_joined':
        return 'bg-green-100 text-green-800';
      case 'user_left':
        return 'bg-gray-100 text-gray-800';
      case 'admin_action':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getActivityLabel(type: string): string {
    switch (type) {
      case 'message':
        return 'Message';
      case 'user_joined':
        return 'Connexion';
      case 'user_left':
        return 'Déconnexion';
      case 'admin_action':
        return 'Admin';
      default:
        return 'Activité';
    }
  }

  getIconPath(icon: string): string {
    const icons: Record<string, string> = {
      chat: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      users:
        'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      settings:
        'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    };
    return icons[icon] || icons['settings'];
  }

  getSentPercentage(): number {
    const stats = this.stats();
    if (!stats || !stats.messagesSent || !stats.messagesReceived) return 0;
    const total = stats.messagesSent + stats.messagesReceived;
    return (stats.messagesSent / total) * 100;
  }

  getReceivedPercentage(): number {
    const stats = this.stats();
    if (!stats || !stats.messagesSent || !stats.messagesReceived) return 0;
    const total = stats.messagesSent + stats.messagesReceived;
    return (stats.messagesReceived / total) * 100;
  }

  getMessageRatio(): string {
    const stats = this.stats();
    if (!stats || !stats.messagesReceived) return '0:0';
    const ratio = stats.messagesSent / stats.messagesReceived;
    return `${ratio.toFixed(1)}:1`;
  }
}
