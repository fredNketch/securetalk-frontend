import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UsersService } from '../../core/services/users.service';
import { AuthService } from '../../core/auth/auth.service';
import { UserCardComponent } from './components/user-card.component';
import { UserSearchComponent } from './components/user-search.component';
import { UserFilterComponent } from './components/user-filter.component';
import { User, UserSearchFilter } from '../../core/models/user.models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UserCardComponent,
    UserSearchComponent,
    UserFilterComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="max-w-7xl mx-auto p-6">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Utilisateurs</h1>
            <p class="text-gray-600 mt-1">
              {{ totalUsers() }} utilisateurs · {{ onlineCount() }} en ligne
            </p>
          </div>

          <!-- Vue modes -->
          <div class="flex items-center space-x-4">
            <div class="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                (click)="viewMode.set('grid')"
                class="px-3 py-1 rounded-md text-sm font-medium transition-colors"
                [class.bg-white]="viewMode() === 'grid'"
                [class.text-gray-900]="viewMode() === 'grid'"
                [class.shadow-sm]="viewMode() === 'grid'"
                [class.text-gray-600]="viewMode() !== 'grid'"
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
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  ></path>
                </svg>
              </button>
              <button
                (click)="viewMode.set('list')"
                class="px-3 py-1 rounded-md text-sm font-medium transition-colors"
                [class.bg-white]="viewMode() === 'list'"
                [class.text-gray-900]="viewMode() === 'list'"
                [class.shadow-sm]="viewMode() === 'list'"
                [class.text-gray-600]="viewMode() !== 'list'"
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
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Recherche et filtres -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="lg:col-span-2">
            <app-user-search (searchChanged)="onSearchChanged($event)">
            </app-user-search>
          </div>
          <div>
            <app-user-filter (filterChanged)="onFilterChanged($event)">
            </app-user-filter>
          </div>
        </div>
      </div>

      <!-- Statistiques rapides -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-lg p-6 border border-gray-200">
          <div class="flex items-center">
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
              <p class="text-sm font-medium text-gray-500">Total</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ totalUsers() }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 border border-gray-200">
          <div class="flex items-center">
            <div
              class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">En ligne</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ onlineCount() }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 border border-gray-200">
          <div class="flex items-center">
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                ></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Admins</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ adminCount() }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 border border-gray-200">
          <div class="flex items-center">
            <div
              class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-5 h-5 text-yellow-600"
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
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Inactifs</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ inactiveCount() }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des utilisateurs -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <!-- Loading state -->
        <div *ngIf="loading()" class="p-6">
          <div class="grid" [class]="getGridClass()">
            <div *ngFor="let item of [1, 2, 3, 4, 5, 6]" class="animate-pulse">
              <div
                class="flex items-center space-x-4"
                *ngIf="viewMode() === 'list'"
              >
                <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div
                class="p-6 border border-gray-200 rounded-lg"
                *ngIf="viewMode() === 'grid'"
              >
                <div class="flex flex-col items-center text-center">
                  <div class="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                  <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Users grid/list -->
        <div *ngIf="!loading()" class="p-6">
          <div class="grid" [class]="getGridClass()">
            <app-user-card
              *ngFor="let user of displayedUsers(); trackBy: trackByUser"
              [user]="user"
              [viewMode]="viewMode()"
              [isAdmin]="isAdmin()"
              (userClicked)="selectUser($event)"
              (connectClicked)="sendConnectionRequest($event)"
              (blockClicked)="blockUser($event)"
              (editClicked)="editUser($event)"
            >
            </app-user-card>
          </div>

          <!-- Empty state -->
          <div *ngIf="displayedUsers().length === 0" class="text-center py-12">
            <div
              class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                ></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              Aucun utilisateur trouvé
            </h3>
            <p class="text-gray-500">
              {{ hasActiveFilters() ? 'Essayez de modifier vos filtres de recherche' : 'Il n'y a aucun utilisateur pour le moment' }}
            </p>
            <button
              *ngIf="hasActiveFilters()"
              (click)="clearFilters()"
              class="mt-4 btn-outline"
            >
              Effacer les filtres
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div
          *ngIf="!loading() && displayedUsers().length > 0"
          class="border-t border-gray-200 bg-gray-50 px-6 py-3 flex items-center justify-between"
        >
          <div class="text-sm text-gray-700">
            Affichage de {{ getStartIndex() }} à {{ getEndIndex() }} sur
            {{ totalUsers() }} utilisateurs
          </div>

          <div class="flex items-center space-x-2">
            <button
              (click)="previousPage()"
              [disabled]="currentPage() === 0"
              class="px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>

            <div class="flex items-center space-x-1">
              <button
                *ngFor="let page of getPageNumbers()"
                (click)="goToPage(page)"
                class="px-3 py-1 text-sm font-medium rounded-md"
                [class.bg-primary-500]="page === currentPage()"
                [class.text-white]="page === currentPage()"
                [class.text-gray-500]="page !== currentPage()"
                [class.hover:text-gray-700]="page !== currentPage()"
              >
                {{ page + 1 }}
              </button>
            </div>

            <button
              (click)="nextPage()"
              [disabled]="!hasNextPage()"
              class="px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class UsersComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly authService = inject(AuthService);

  // Signals locaux
  readonly viewMode = signal<'grid' | 'list'>('grid');
  readonly currentPage = signal(0);
  readonly pageSize = signal(12);
  readonly searchQuery = signal('');
  readonly activeFilter = signal<UserSearchFilter>({});

  // Data from services
  readonly users = this.usersService.users;
  readonly filteredUsers = this.usersService.filteredUsers;
  readonly loading = this.usersService.loading;
  readonly onlineCount = this.usersService.onlineUsersCount;
  readonly isAdmin = this.authService.isAdmin;

  // Computed values
  readonly totalUsers = computed(() => this.filteredUsers().length);

  readonly adminCount = computed(
    () =>
      this.filteredUsers().filter((user) =>
        user.roles.some((role) => role.name === 'ADMIN'),
      ).length,
  );

  readonly inactiveCount = computed(
    () => this.filteredUsers().filter((user) => !user.enabled).length,
  );

  readonly displayedUsers = computed(() => {
    const users = this.filteredUsers();
    const start = this.currentPage() * this.pageSize();
    const end = start + this.pageSize();
    return users.slice(start, end);
  });

  readonly hasNextPage = computed(() => {
    const totalPages = Math.ceil(this.totalUsers() / this.pageSize());
    return this.currentPage() < totalPages - 1;
  });

  readonly hasActiveFilters = computed(() => {
    const filter = this.activeFilter();
    return !!(
      filter.query ||
      filter.role !== 'ALL' ||
      filter.status !== 'all' ||
      filter.enabled !== undefined
    );
  });

  ngOnInit() {
    this.usersService.loadUsers().subscribe();
  }

  onSearchChanged(query: string) {
    this.searchQuery.set(query);
    this.updateFilter();
    this.currentPage.set(0);
  }

  onFilterChanged(filter: UserSearchFilter) {
    this.activeFilter.set(filter);
    this.updateFilter();
    this.currentPage.set(0);
  }

  private updateFilter() {
    const combinedFilter: UserSearchFilter = {
      ...this.activeFilter(),
      query: this.searchQuery(),
    };
    this.usersService.searchUsers(combinedFilter);
  }

  selectUser(user: User) {
    // TODO: Navigate to user detail or open modal
    console.log('Select user:', user);
  }

  sendConnectionRequest(user: User) {
    this.usersService.sendConnectionRequest(user.id).subscribe({
      next: () => {
        console.log(`Connection request sent to ${user.username}`);
      },
      error: (error) => {
        console.error('Error sending connection request:', error);
      },
    });
  }

  blockUser(user: User) {
    if (confirm(`Êtes-vous sûr de vouloir bloquer ${user.username} ?`)) {
      this.usersService.blockUser(user.id).subscribe({
        next: () => {
          console.log(`User ${user.username} blocked`);
        },
        error: (error) => {
          console.error('Error blocking user:', error);
        },
      });
    }
  }

  editUser(user: User) {
    // TODO: Open edit user modal (admin only)
    console.log('Edit user:', user);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.activeFilter.set({});
    this.updateFilter();
    this.currentPage.set(0);
  }

  // Pagination
  nextPage() {
    if (this.hasNextPage()) {
      this.currentPage.update((page) => page + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update((page) => page - 1);
    }
  }

  goToPage(page: number) {
    this.currentPage.set(page);
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalUsers() / this.pageSize());
    const current = this.currentPage();
    const pages: number[] = [];

    // Afficher au maximum 5 pages
    let start = Math.max(0, current - 2);
    let end = Math.min(totalPages - 1, start + 4);

    // Ajuster si on est proche de la fin
    if (end - start < 4) {
      start = Math.max(0, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  getStartIndex(): number {
    return this.currentPage() * this.pageSize() + 1;
  }

  getEndIndex(): number {
    return Math.min(
      (this.currentPage() + 1) * this.pageSize(),
      this.totalUsers(),
    );
  }

  getGridClass(): string {
    if (this.viewMode() === 'grid') {
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
    } else {
      return 'grid-cols-1 gap-4';
    }
  }

  trackByUser(index: number, user: User): number {
    return user.id;
  }
}
