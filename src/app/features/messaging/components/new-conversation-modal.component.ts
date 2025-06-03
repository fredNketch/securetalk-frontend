import { Component, inject, signal, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../core/services/users.service';
import { User } from '../../../core/models/user.models';
import { MessagingService } from '../../../core/services/messaging.service';

@Component({
  selector: 'app-new-conversation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
      *ngIf="isOpen()"
    >
      <div
        class="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Nouvelle conversation</h3>
        </div>

        <!-- Search -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="relative">
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
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

        <!-- User list -->
        <div class="px-6 py-4 max-h-64 overflow-y-auto">
          <div *ngIf="loading()" class="py-4 space-y-4">
            <!-- Skeleton loading -->
            <div *ngFor="let item of [1, 2, 3]" class="animate-pulse">
              <div class="flex items-center space-x-3 p-3">
                <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="!loading() && filteredUsers().length === 0" class="py-8 text-center">
            <p class="text-gray-500">Aucun utilisateur trouvé</p>
          </div>

          <div *ngIf="!loading()">
            <div
              *ngFor="let user of filteredUsers()"
              class="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              (click)="selectUser(user)"
            >
              <div class="relative">
                <!-- Avatar -->
                <div
                  class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-medium"
                >
                  {{ getInitials(user) }}
                </div>
                <!-- Status indicator -->
                <div
                  class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
                  [class.bg-green-400]="user.isOnline"
                  [class.bg-gray-400]="!user.isOnline"
                ></div>
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-medium text-gray-900">
                  {{ getDisplayName(user) }}
                </h4>
                <p class="text-xs text-gray-500">{{ user.email }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors mr-2"
            (click)="close.emit()"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  `,
})
export class NewConversationModalComponent {
  private readonly usersService = inject(UsersService);
  private readonly messagingService = inject(MessagingService);

  // Inputs/Outputs
  isOpen = input(false);
  close = output<void>();
  
  // State
  searchQuery = signal('');
  
  // Data from services
  readonly loading = this.usersService.loading;
  readonly users = this.usersService.users;
  readonly filteredUsers = this.usersService.filteredUsers;
  
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.usersService.searchUsers({ query });
  }
  
  selectUser(user: User): void {
    this.messagingService.startConversationWithUser(user);
    this.close.emit();
  }
  
  getInitials(user: User): string {
    if (user.firstName && user.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    return user.username?.charAt(0).toUpperCase() || '?';
  }
  
  getDisplayName(user: User): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || 'Utilisateur inconnu';
  }
}
