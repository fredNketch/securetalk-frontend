import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="h-screen flex bg-gray-50">
      <!-- Sidebar -->
      <aside
        class="bg-white shadow-sm border-r border-gray-200 transition-all duration-300"
        [class.w-64]="!sidebarCollapsed()"
        [class.w-16]="sidebarCollapsed()"
      >
        <!-- Logo -->
        <div class="flex items-center gap-3 p-4 border-b border-gray-200">
          <div
            class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0"
          >
            <svg
              class="w-5 h-5 text-white"
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
          <h1
            *ngIf="!sidebarCollapsed()"
            class="text-xl font-bold text-gray-900 transition-opacity duration-300"
          >
            SecureTalk
          </h1>
        </div>

        <!-- Navigation -->
        <nav class="mt-4 px-2 space-y-1">
          <a
            *ngFor="let item of visibleNavItems()"
            [routerLink]="item.route"
            routerLinkActive="bg-primary-50 text-primary-700 border-r-2 border-primary-500"
            class="group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
            [class.justify-center]="sidebarCollapsed()"
          >
            <svg
              class="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                [attr.d]="item.iconPath"
              ></path>
            </svg>

            <span
              *ngIf="!sidebarCollapsed()"
              class="transition-opacity duration-300"
            >
              {{ item.label }}
            </span>

            <span
              *ngIf="item.badge && !sidebarCollapsed()"
              class="ml-auto bg-primary-100 text-primary-600 text-xs px-2 py-1 rounded-full"
            >
              {{ item.badge }}
            </span>
          </a>
        </nav>

        <!-- Collapse Button -->
        <div class="absolute bottom-4 left-2 right-2">
          <button
            (click)="toggleSidebar()"
            class="w-full p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <svg
              class="w-5 h-5 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                [attr.d]="
                  sidebarCollapsed() ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'
                "
              ></path>
            </svg>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-gray-200">
          <div class="flex items-center justify-between h-16 px-6">
            <!-- Page Title -->
            <div>
              <h2 class="text-lg font-semibold text-gray-900">
                {{ currentPageTitle() }}
              </h2>
            </div>

            <!-- User Menu -->
            <div class="flex items-center gap-4">
              <!-- Notifications -->
              <button
                class="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 17h5l-4.5-4.5L15 17zm5-5v-1a7 7 0 00-7-7v-1a1 1 0 00-2 0v1a7 7 0 00-7 7v1H4a1 1 0 000 2h16a1 1 0 000-2z"
                  ></path>
                </svg>
                <!-- Badge de notification -->
                <span
                  class="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                >
                  3
                </span>
              </button>

              <!-- User Dropdown -->
              <div
                class="relative"
                [class.open]="userMenuOpen()"
                (clickOutside)="userMenuOpen.set(false)"
              >
                <button
                  (click)="toggleUserMenu()"
                  class="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <!-- Avatar -->
                  <div
                    class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  >
                    {{ userInitials() }}
                  </div>

                  <div class="hidden md:block text-left">
                    <div class="text-sm font-medium text-gray-900">
                      {{ currentUser()?.username }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ currentUser()?.roles?.join(', ') }}
                    </div>
                  </div>

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
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>

                <!-- Dropdown Menu -->
                <div
                  *ngIf="userMenuOpen()"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
                >
                  <a
                    routerLink="/profile"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <svg
                      class="w-4 h-4 inline mr-2"
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
                    Mon profil
                  </a>
                  <a
                    routerLink="/settings"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <svg
                      class="w-4 h-4 inline mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      ></path>
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                    </svg>
                    Paramètres
                  </a>
                  <div class="border-t border-gray-100 my-1"></div>
                  <button
                    (click)="logout()"
                    class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <svg
                      class="w-4 h-4 inline mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      ></path>
                    </svg>
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class AppLayoutComponent implements OnInit {
  private readonly authService = inject(AuthService);

  // Signals
  readonly sidebarCollapsed = signal(false);
  readonly userMenuOpen = signal(false);
  readonly currentUser = this.authService.currentUser;
  readonly userInitials = this.authService.userInitials;
  readonly isAdmin = this.authService.isAdmin;

  // Navigation items
  private readonly navigationItems = signal([
    {
      label: 'Tableau de bord',
      route: '/dashboard',
      iconPath:
        'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
      adminOnly: false,
    },
    {
      label: 'Messages',
      route: '/messages',
      iconPath:
        'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      badge: 5,
      adminOnly: false,
    },
    {
      label: 'Utilisateurs',
      route: '/users',
      iconPath:
        'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      adminOnly: false,
    },
    {
      label: 'Administration',
      route: '/admin',
      iconPath:
        'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      adminOnly: true,
    },
  ]);

  readonly visibleNavItems = computed(() => {
    return this.navigationItems().filter(
      (item) => !item.adminOnly || this.isAdmin(),
    );
  });

  readonly currentPageTitle = computed(() => {
    // TODO: Get from router or route data
    return 'Tableau de bord';
  });

  ngOnInit() {
    // Auto-collapse sidebar on mobile
    // TODO: Add breakpoint observer
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }

  logout(): void {
    this.userMenuOpen.set(false);
    this.authService.logout();
  }
}
