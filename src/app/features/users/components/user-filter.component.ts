import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserSearchFilter } from '../../../core/models/user.models';

@Component({
  selector: 'app-user-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg p-4 border border-gray-200">
      <h3 class="text-sm font-medium text-gray-700 mb-3">Filtres</h3>
      
      <div class="space-y-4">
        <!-- Filtre par statut -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-2">Statut</label>
          <select 
            [(ngModel)]="filter.status"
            (change)="onFilterChange()"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm">
            <option value="all">Tous</option>
            <option value="online">En ligne</option>
            <option value="offline">Hors ligne</option>
          </select>
        </div>
        
        <!-- Filtre par rôle -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-2">Rôle</label>
          <select 
            [(ngModel)]="filter.role"
            (change)="onFilterChange()"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm">
            <option value="ALL">Tous</option>
            <option value="ADMIN">Administrateur</option>
            <option value="MODERATOR">Modérateur</option>
            <option value="USER">Utilisateur</option>
          </select>
        </div>
        
        <!-- Tri -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-2">Trier par</label>
          <select 
            [(ngModel)]="filter.sortBy"
            (change)="onFilterChange()"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm">
            <option value="username">Nom d'utilisateur</option>
            <option value="lastLogin">Activité récente</option>
            <option value="createdAt">Date d'inscription</option>
            <option value="email">Email</option>
          </select>
        </div>
      </div>
    </div>
  `,
})
export class UserFilterComponent {
  filterChanged = output<UserSearchFilter>();
  
  filter: UserSearchFilter = {
    status: 'all',
    role: 'ALL',
    sortBy: 'username'
  };
  
  onFilterChange() {
    this.filterChanged.emit(this.filter);
  }
}
