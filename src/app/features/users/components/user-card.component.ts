import { Component, input, output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../core/models/user.models';
import { StatusIndicatorComponent } from '../../../shared/components/status-indicator.component';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, StatusIndicatorComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <!-- Grid View -->
    <div *ngIf="viewMode() === 'grid'" 
         class="card p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
         (click)="onUserClick()">
      
      <div class="flex flex-col items-center text-center">
        <!-- Avatar avec statut -->
        <div class="relative mb-4">
          <div class="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl font-medium"
               [class.opacity-50]="!user().enabled">
            {{ getInitials() }}
          </div>
          <app-status-indicator 
            [status]="user().isOnline ? 'online' : 'offline'"
            [size]="'md'"
            class="absolute -bottom-1 -right-1">
          </app-status-indicator>
          
          <!-- Badge inactif -->
          <div *ngIf="!user().enabled" 
               class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728">
              </path>
            </svg>
          </div>
        </div>
        
        <!-- Informations utilisateur -->
        <h3 class="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
          {{ getDisplayName() }}
        </h3>
        <p class="text-sm text-gray-500 mb-2">{{ user().username }}</p>
        
        <!-- Rôles -->
        <div class="flex flex-wrap gap-1 mb-3">
          <span 
            *ngFor="let role of user().roles"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            [ngClass]="getRoleBadgeClass(role.name)">
            {{ getRoleLabel(role.name) }}
          </span>
        </div>
        
        <!-- Bio (si présente) -->
        <p *ngIf="user().bio" class="text-sm text-gray-600 mb-4 line-clamp-2">
          {{ user().bio }}
        </p>
        
        <!-- Statistiques -->
        <div class="flex items-center justify-center space-x-4 text-xs text-gray-500 mb-4">
          <div class="flex items-center">
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z">
              </path>
            </svg>
            {{ user().totalMessages || 0 }}
          </div>
          <div class="flex items-center">
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z">
              </path>
            </svg>
            {{ user().totalConnections || 0 }}
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex items-center space-x-2 w-full">
          <button 
            (click)="onConnectClick($event)"
            class="flex-1 btn-primary text-sm py-2"
            [disabled]="!user().enabled">
            Connecter
          </button>
          
          <!-- Menu actions admin -->
          <div *ngIf="isAdmin()" class="relative">
            <button 
              (click)="onEditClick($event)"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z">
                </path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div *ngIf="viewMode() === 'list'" 
         class="p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
         (click)="onUserClick()">
      
      <div class="flex items-center space-x-4">
        <!-- Avatar avec statut -->
        <div class="relative flex-shrink-0">
          <div class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium"
               [class.opacity-50]="!user().enabled">
            {{ getInitials() }}
          </div>
          <app-status-indicator 
            [status]="user().isOnline ? 'online' : 'offline'"
            [size]="'sm'"
            class="absolute -bottom-1 -right-1">
          </app-status-indicator>
        </div>
        
        <!-- Informations principales -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2">
            <h3 class="text-base font-medium text-gray-900 truncate">
              {{ getDisplayName() }}
            </h3>
            <span class="text-sm text-gray-500">{{ '@' + user().username }}</span>
            
            <!-- Badges de rôle -->
            <span 
              *ngFor="let role of user().roles"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              [ngClass]="getRoleBadgeClass(role.name)">
              {{ getRoleLabel(role.name) }}
            </span>
            
            <!-- Badge inactif -->
            <span *ngIf="!user().enabled" 
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Inactif
            </span>
          </div>
          
          <div class="flex items-center space-x-4 mt-1">
            <p class="text-sm text-gray-600">{{ user().email }}</p>
            <div class="flex items-center space-x-3 text-xs text-gray-500">
              <span>{{ user().totalMessages || 0 }} messages</span>
              <span>{{ user().totalConnections || 0 }} connexions</span>
              <span *ngIf="user().lastLogin">
                Vu {{ user().lastLogin }}
              </span>
            </div>
          </div>
          
          <p *ngIf="user().bio" class="text-sm text-gray-600 mt-1 truncate">
            {{ user().bio }}
          </p>
        </div>
        
        <!-- Actions -->
        <div class="flex items-center space-x-2 flex-shrink-0">
          <button 
            (click)="onConnectClick($event)"
            class="btn-outline text-sm py-1 px-3"
            [disabled]="!user().enabled">
            Connecter
          </button>
          
          <button 
            *ngIf="isAdmin()"
            (click)="onEditClick($event)"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
              </path>
            </svg>
          </button>
          
          <button 
            (click)="onBlockClick($event)"
            class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728">
              </path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class UserCardComponent {
  // Inputs
  user = input.required<User>();
  viewMode = input<'grid' | 'list'>('grid');
  isAdmin = input(false);

  // Outputs
  userClicked = output<User>();
  connectClicked = output<User>();
  blockClicked = output<User>();
  editClicked = output<User>();

  getInitials(): string {
    const user = this.user();
    if (user.firstName && user.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    return user.username.charAt(0).toUpperCase();
  }

  getDisplayName(): string {
    const user = this.user();
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MODERATOR':
        return 'bg-orange-100 text-orange-800';
      case 'USER':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Admin';
      case 'MODERATOR':
        return 'Modérateur';
      case 'USER':
        return 'Utilisateur';
      default:
        return role;
    }
  }

  onUserClick() {
    this.userClicked.emit(this.user());
  }

  onConnectClick(event: Event) {
    event.stopPropagation();
    this.connectClicked.emit(this.user());
  }

  onBlockClick(event: Event) {
    event.stopPropagation();
    this.blockClicked.emit(this.user());
  }

  onEditClick(event: Event) {
    event.stopPropagation();
    this.editClicked.emit(this.user());
  }
}
