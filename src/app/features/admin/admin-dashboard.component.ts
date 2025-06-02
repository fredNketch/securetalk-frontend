import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import {
  AdminService,
  AdminStats,
  SystemAlert,
  UserActivity,
} from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <!-- Header Admin -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <div
            class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center"
          >
            <svg
              class="w-6 h-6 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              ></path>
            </svg>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              Administration SecureTalk
            </h1>
            <p class="text-gray-600">Tableau de bord administrateur</p>
          </div>
        </div>

        <!-- System Health Badge -->
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
          [ngClass]="getHealthBadgeClass()"
        >
          <div
            class="w-2 h-2 rounded-full"
            [ngClass]="getHealthDotClass()"
          ></div>
          Système: {{ getHealthLabel() }}
        </div>
      </div>

      <!-- Admin Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Users -->
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                ></path>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">
                Total Utilisateurs
              </h3>
              <div class="flex items-baseline">
                <p class="text-2xl font-semibold text-gray-900">
                  {{ adminStats()?.totalUsers || 0 | number }}
                </p>
                <span class="ml-2 text-sm font-medium text-green-600"
                  >+{{ adminStats()?.activeUsers || 0 }} actifs</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Active Users -->
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">
                Utilisateurs Actifs
              </h3>
              <div class="flex items-baseline">
                <p class="text-2xl font-semibold text-gray-900">
                  {{ adminStats()?.activeUsers || 0 | number }}
                </p>
                <span class="ml-2 text-sm font-medium text-blue-600">
                  {{ getActiveUserPercentage() }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Messages -->
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                ></path>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">Messages Totaux</h3>
              <div class="flex items-baseline">
                <p class="text-2xl font-semibold text-gray-900">
                  {{ adminStats()?.totalMessages || 0 | number }}
                </p>
                <span class="ml-2 text-sm font-medium text-green-600">
                  +{{ adminStats()?.messagesLastWeek || 0 | number }} cette
                  semaine
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Server Status -->
        <div class="card p-6">
          <div class="flex items-center">
            <div
              class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                ></path>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">Charge Serveur</h3>
              <div class="flex items-baseline">
                <p class="text-2xl font-semibold text-gray-900">
                  {{ adminStats()?.serverLoad || 0 }}%
                </p>
                <span
                  class="ml-2 text-sm font-medium"
                  [ngClass]="getServerLoadClass()"
                >
                  {{ getServerLoadStatus() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Alerts -->
      <div class="mb-8" *ngIf="systemAlerts().length > 0">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          🚨 Alertes Système
        </h3>
        <div class="space-y-3">
          <div
            *ngFor="let alert of unresolvedAlerts()"
            class="p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-sm"
            [ngClass]="getAlertClass(alert.type)"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg
                  class="w-5 h-5 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    [attr.d]="getAlertIcon(alert.type)"
                  ></path>
                </svg>
              </div>
              <div class="ml-3 flex-1">
                <h4 class="text-sm font-medium">{{ alert.title }}</h4>
                <p class="text-sm mt-1">{{ alert.message }}</p>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-xs">{{ formatTime(alert.timestamp) }}</span>
                  <button
                    (click)="resolveAlert(alert.id)"
                    class="text-xs font-medium hover:underline"
                  >
                    Marquer comme résolu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Management Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Quick Admin Actions -->
        <div class="card">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Actions Rapides</h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 gap-3">
              <button
                routerLink="/admin/users"
                class="flex items-center p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-left"
              >
                <div
                  class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    ></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <h4 class="font-medium text-gray-900">
                    Gérer les Utilisateurs
                  </h4>
                  <p class="text-sm text-gray-500">
                    Comptes, rôles, permissions
                  </p>
                </div>
              </button>

              <button
                routerLink="/admin/messages"
                class="flex items-center p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-left"
              >
                📊 Dashboards SecureTalk - Partie 3 🔧 6. Dashboard Admin
                (Suite) 6.1 Admin Dashboard Component (suite) - Template
                typescript// ... suite du template Admin Dashboard Component

                <div
                  class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-purple-600"
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
                  <h4 class="font-medium text-gray-900">Modération Messages</h4>
                  <p class="text-sm text-gray-500">Surveillance, rapports</p>
                </div>
              </button>

              <button
                routerLink="/admin/security"
                class="flex items-center p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-left"
              >
                <div
                  class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    ></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <h4 class="font-medium text-gray-900">Sécurité & Logs</h4>
                  <p class="text-sm text-gray-500">Audit, incidents</p>
                </div>
              </button>

              <button
                routerLink="/admin/settings"
                class="flex items-center p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-left"
              >
                <div
                  class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <h4 class="font-medium text-gray-900">Configuration</h4>
                  <p class="text-sm text-gray-500">Paramètres système</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Recent User Activity -->
        <div class="card">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">
                Activité Utilisateurs
              </h3>
              <button
                routerLink="/admin/users"
                class="text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                Voir tout
              </button>
            </div>
          </div>
          <div class="p-6">
            <div *ngIf="loading()" class="space-y-4">
              <div *ngFor="let item of [1, 2, 3, 4]" class="animate-pulse">
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
                *ngFor="let user of recentUsers()"
                class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <!-- Avatar avec statut -->
                  <div class="relative">
                    <div
                      class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    >
                      {{ user.username.charAt(0).toUpperCase() }}
                    </div>
                    <div
                      class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                      [ngClass]="getUserStatusClass(user.status)"
                    ></div>
                  </div>

                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      {{ user.username }}
                    </p>
                    <p class="text-xs text-gray-500">{{ user.email }}</p>
                    <p class="text-xs text-gray-400">
                      Dernière connexion: {{ formatTime(user.lastLogin) }}
                    </p>
                  </div>
                </div>

                <div class="text-right">
                  <div class="text-sm font-medium text-gray-900">
                    {{ user.messagesCount }} messages
                  </div>
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    [ngClass]="getUserStatusBadgeClass(user.status)"
                  >
                    {{ getUserStatusLabel(user.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Resources -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Storage Usage -->
        <div class="card">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
              Utilisation du Stockage
            </h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-600">Stockage utilisé</span>
                  <span class="font-medium"
                    >{{ adminStats()?.storageUsed || 0 }}% de 100 GB</span
                  >
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div
                    class="h-3 rounded-full transition-all duration-500"
                    [ngClass]="getStorageBarClass()"
                    [style.width.%]="adminStats()?.storageUsed || 0"
                  ></div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 mt-6">
                <div class="bg-gray-50 rounded-lg p-3 text-center">
                  <p class="text-sm text-gray-600">Messages</p>
                  <p class="text-lg font-semibold text-gray-900">
                    {{ getStorageMessages() }} GB
                  </p>
                </div>
                <div class="bg-gray-50 rounded-lg p-3 text-center">
                  <p class="text-sm text-gray-600">Fichiers</p>
                  <p class="text-lg font-semibold text-gray-900">
                    {{ getStorageFiles() }} GB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Metrics -->
        <div class="card">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
              Métriques de Performance
            </h3>
          </div>
          <div class="p-6">
            <div class="space-y-6">
              <!-- CPU Usage -->
              <div>
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-600">Utilisation CPU</span>
                  <span class="font-medium"
                    >{{ adminStats()?.serverLoad || 0 }}%</span
                  >
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all duration-500"
                    [ngClass]="getCpuBarClass()"
                    [style.width.%]="adminStats()?.serverLoad || 0"
                  ></div>
                </div>
              </div>

              <!-- Memory Usage -->
              <div>
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-600">Utilisation Mémoire</span>
                  <span class="font-medium">67%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style="width: 67%"
                  ></div>
                </div>
              </div>

              <!-- Network -->
              <div>
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-600">Trafic Réseau</span>
                  <span class="font-medium">2.4 MB/s</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style="width: 34%"
                  ></div>
                </div>
              </div>

              <!-- Uptime -->
              <div class="bg-green-50 rounded-lg p-4 text-center">
                <p class="text-sm text-green-600 font-medium">
                  Temps de fonctionnement
                </p>
                <p class="text-2xl font-bold text-green-700">99.9%</p>
                <p class="text-xs text-green-600">7 jours, 14h, 32m</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly adminService = inject(AdminService);

  // Signals
  readonly currentUser = this.authService.currentUser;
  readonly loading = signal(true);
  readonly adminStats = signal<AdminStats | null>(null);
  readonly systemAlerts = signal<SystemAlert[]>([]);
  readonly recentUsers = signal<UserActivity[]>([]);

  // Computed values
  readonly unresolvedAlerts = computed(() =>
    this.systemAlerts().filter((alert) => !alert.resolved),
  );

  ngOnInit() {
    this.loadAdminData();
  }

  private loadAdminData() {
    this.loading.set(true);

    // Charger les statistiques admin
    this.adminService.getAdminStats().subscribe({
      next: (stats) => {
        this.adminStats.set(stats);
        this.loading.set(false);
      },
      error: (error) => {
        console.error(
          'Erreur lors du chargement des statistiques admin:',
          error,
        );
        this.loading.set(false);
      },
    });

    // Charger les alertes système
    this.adminService.getSystemAlerts().subscribe({
      next: (alerts) => {
        this.systemAlerts.set(alerts);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des alertes:', error);
      },
    });

    // Charger l'activité des utilisateurs récents
    this.adminService.getRecentUsers().subscribe({
      next: (users) => {
        this.recentUsers.set(users);
      },
      error: (error) => {
        console.error(
          'Erreur lors du chargement des utilisateurs récents:',
          error,
        );
      },
    });
  }

  // Méthodes utilitaires pour les classes CSS et labels
  getHealthBadgeClass(): string {
    const health = this.adminStats()?.systemHealth;
    switch (health) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getHealthDotClass(): string {
    const health = this.adminStats()?.systemHealth;
    switch (health) {
      case 'excellent':
        return 'bg-green-400';
      case 'good':
        return 'bg-blue-400';
      case 'warning':
        return 'bg-yellow-400';
      case 'critical':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  }

  getHealthLabel(): string {
    const health = this.adminStats()?.systemHealth;
    switch (health) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Bon';
      case 'warning':
        return 'Attention';
      case 'critical':
        return 'Critique';
      default:
        return 'Inconnu';
    }
  }

  getActiveUserPercentage(): number {
    const stats = this.adminStats();
    if (!stats || !stats.totalUsers) return 0;
    return Math.round((stats.activeUsers / stats.totalUsers) * 100);
  }

  getServerLoadClass(): string {
    const load = this.adminStats()?.serverLoad || 0;
    if (load < 50) return 'text-green-600';
    if (load < 80) return 'text-yellow-600';
    return 'text-red-600';
  }

  getServerLoadStatus(): string {
    const load = this.adminStats()?.serverLoad || 0;
    if (load < 50) return 'Normal';
    if (load < 80) return 'Élevé';
    return 'Critique';
  }

  getAlertClass(type: string): string {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-400 text-red-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-400 text-yellow-700';
      case 'info':
        return 'bg-blue-50 border-blue-400 text-blue-700';
      case 'success':
        return 'bg-green-50 border-green-400 text-green-700';
      default:
        return 'bg-gray-50 border-gray-400 text-gray-700';
    }
  }

  getAlertIcon(type: string): string {
    switch (type) {
      case 'error':
        return 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'warning':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      case 'info':
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'success':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  getUserStatusClass(status: string): string {
    switch (status) {
      case 'online':
        return 'bg-green-400';
      case 'offline':
        return 'bg-gray-400';
      case 'banned':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  }

  getUserStatusBadgeClass(status: string): string {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      case 'banned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getUserStatusLabel(status: string): string {
    switch (status) {
      case 'online':
        return 'En ligne';
      case 'offline':
        return 'Hors ligne';
      case 'banned':
        return 'Banni';
      default:
        return 'Inconnu';
    }
  }

  getStorageBarClass(): string {
    const usage = this.adminStats()?.storageUsed || 0;
    if (usage < 70) return 'bg-green-500';
    if (usage < 85) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getCpuBarClass(): string {
    const usage = this.adminStats()?.serverLoad || 0;
    if (usage < 60) return 'bg-green-500';
    if (usage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getStorageMessages(): number {
    const usage = this.adminStats()?.storageUsed || 0;
    return Math.round(usage * 0.7); // 70% pour les messages
  }

  getStorageFiles(): number {
    const usage = this.adminStats()?.storageUsed || 0;
    return Math.round(usage * 0.3); // 30% pour les fichiers
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
    if (days < 7) return `${days}j`;
    return timestamp.toLocaleDateString();
  }

  resolveAlert(alertId: number): void {
    this.systemAlerts.update((alerts) =>
      alerts.map((alert) =>
        alert.id === alertId ? { ...alert, resolved: true } : alert,
      ),
    );
  }
}
