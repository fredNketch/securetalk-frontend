import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, catchError, map, delay } from 'rxjs';
import {
  User,
  UserSearchFilter,
  PaginatedUsers,
  UserConnection,
  UserActivity,
} from '../models/user.models';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly apiUrl = 'https://localhost:8443/api';

  // Signals pour l'état des utilisateurs
  private readonly _users = signal<User[]>([]);
  private readonly _selectedUser = signal<User | null>(null);
  private readonly _loading = signal(false);
  private readonly _searchFilter = signal<UserSearchFilter>({});
  private readonly _connections = signal<UserConnection[]>([]);

  // Computed values publics
  readonly users = this._users.asReadonly();
  readonly selectedUser = this._selectedUser.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly searchFilter = this._searchFilter.asReadonly();
  readonly connections = this._connections.asReadonly();

  readonly filteredUsers = computed(() => {
    const users = this._users();
    const filter = this._searchFilter();

    return users.filter((user) => {
      // Filtre par query
      if (filter.query) {
        const query = filter.query.toLowerCase();
        const matchesQuery =
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.firstName?.toLowerCase().includes(query) ||
          user.lastName?.toLowerCase().includes(query);

        if (!matchesQuery) return false;
      }

      // Filtre par rôle
      if (filter.role && filter.role !== 'ALL') {
        const hasRole = user.roles.some((role) => role.name === filter.role);
        if (!hasRole) return false;
      }

      // Filtre par statut
      if (filter.status && filter.status !== 'all') {
        if (filter.status === 'online' && !user.isOnline) return false;
        if (filter.status === 'offline' && user.isOnline) return false;
      }

      // Filtre par enabled
      if (filter.enabled !== undefined && user.enabled !== filter.enabled) {
        return false;
      }

      return true;
    });
  });

  readonly onlineUsersCount = computed(
    () => this._users().filter((user) => user.isOnline).length,
  );

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    // Charger les utilisateurs au démarrage
    this.loadUsers();
  }

  // Charger la liste des utilisateurs
  loadUsers(page: number = 0, size: number = 20): Observable<PaginatedUsers> {
    this._loading.set(true);

    // Récupérer tous les utilisateurs sauf l'utilisateur courant
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      map(users => {
        // Filtrer l'utilisateur courant
        const currentUser = this.authService.currentUser();
        const filteredUsers = users.filter(user => {
          return currentUser ? user.id !== currentUser.id : true;
        });
        
        // Convertir en format paginé
        const paginatedResult: PaginatedUsers = {
          users: filteredUsers,
          total: filteredUsers.length,
          page,
          size,
          totalPages: Math.ceil(filteredUsers.length / size),
          hasNext: false,
          hasPrevious: false
        };
        
        this._users.set(filteredUsers);
        this._loading.set(false);
        return paginatedResult;
      }),
      catchError(error => {
        this._loading.set(false);
        console.error('Erreur lors du chargement des utilisateurs:', error);
        return throwError(() => new Error('Impossible de charger les utilisateurs'));
      })
    );
  }

  // Rechercher des utilisateurs
  searchUsers(filter: UserSearchFilter): void {
    this._searchFilter.set(filter);
  }

  // Obtenir un utilisateur par ID
  getUserById(id: number): Observable<User> {
    // Vérifier d'abord si l'utilisateur est déjà dans notre cache
    const cachedUser = this._users().find((u) => u.id === id);
    if (cachedUser) {
      this._selectedUser.set(cachedUser);
      return of(cachedUser);
    }

    // Sinon, récupérer depuis l'API
    return this.http.get<User>(`${this.apiUrl}/users/${id}`).pipe(
      map(user => {
        this._selectedUser.set(user);
        return user;
      }),
      catchError(error => {
        console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error);
        return throwError(() => new Error(`Impossible de récupérer l'utilisateur`));
      })
    );
  }

  // Mettre à jour un utilisateur (admin)
  updateUser(id: number, updates: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, updates, this.getHttpOptions()).pipe(
      map(updatedUser => {
        // Mettre à jour le cache local
        this._users.update(users => 
          users.map(user => user.id === id ? updatedUser : user)
        );
        
        // Mettre à jour l'utilisateur sélectionné si nécessaire
        if (this._selectedUser()?.id === id) {
          this._selectedUser.set(updatedUser);
        }
        
        return updatedUser;
      }),
      catchError(error => {
        console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, error);
        return throwError(() => new Error(`Impossible de mettre à jour l'utilisateur`));
      })
    );
  }

  // Activer/désactiver un utilisateur
  toggleUserStatus(id: number): Observable<User> {
    return this.updateUser(id, {
      enabled: !this._users().find((u) => u.id === id)?.enabled,
    });
  }

  // Changer le rôle d'un utilisateur
  updateUserRole(
    id: number,
    role: 'USER' | 'ADMIN' | 'MODERATOR',
  ): Observable<User> {
    const roleObj = { id: Date.now(), name: role };
    return this.updateUser(id, { roles: [roleObj] });
  }

  // Supprimer un utilisateur
  deleteUser(id: number): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/users/${id}`, this.getHttpOptions()).pipe(
      map(() => {
        this._users.update((users) => users.filter((u) => u.id !== id));
        if (this._selectedUser()?.id === id) {
          this._selectedUser.set(null);
        }
        return true;
      }),
      catchError(error => {
        console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
        return throwError(() => new Error(`Impossible de supprimer l'utilisateur`));
      })
    );
  }

  // Gestion des connexions
  loadConnections(): Observable<UserConnection[]> {
    // Pour l'instant, nous utilisons des connexions simulées car le backend n'a pas cette fonctionnalité
    const mockConnections: UserConnection[] = [
      {
        id: 1,
        user: this._users().find(u => u.username === 'alice') || {
          id: 2,
          username: 'alice',
          email: 'alice@example.com',
          roles: [{ id: 2, name: 'USER' }],
          enabled: true,
          isOnline: true,
          createdAt: new Date().toISOString(),
          isPrivate: false,
          allowMessages: true,
          showOnlineStatus: true,
        },
        connectedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        status: 'accepted',
        isBlocked: false,
      },
      {
        id: 2,
        user: this._users().find(u => u.username === 'bob') || {
          id: 3,
          username: 'bob',
          email: 'bob@example.com',
          roles: [{ id: 2, name: 'USER' }],
          enabled: true,
          isOnline: false,
          createdAt: new Date().toISOString(),
          isPrivate: false,
          allowMessages: true,
          showOnlineStatus: true,
        },
        connectedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        status: 'pending',
        isBlocked: false,
      },
    ];
    
    return of(mockConnections).pipe(
      delay(400),
      map((connections) => {
        this._connections.set(connections);
        return connections;
      }),
    );
  }

  sendConnectionRequest(userId: number): Observable<UserConnection> {
    const newConnection: UserConnection = {
      id: Date.now(),
      user: this._users().find((u) => u.id === userId)!,
      connectedAt: new Date(),
      status: 'pending',
      isBlocked: false,
    };

    this._connections.update((connections) => [...connections, newConnection]);
    return of(newConnection).pipe(delay(300));
  }

  acceptConnection(connectionId: number): Observable<UserConnection> {
    return of(null).pipe(
      delay(300),
      map(() => {
        this._connections.update((connections) =>
          connections.map((conn) =>
            conn.id === connectionId ? { ...conn, status: 'accepted' } : conn,
          ),
        );
        return this._connections().find((c) => c.id === connectionId)!;
      }),
    );
  }

  blockUser(userId: number): Observable<boolean> {
    return of(true).pipe(
      delay(300),
      map(() => {
        this._connections.update((connections) =>
          connections.map((conn) =>
            conn.user.id === userId
              ? { ...conn, isBlocked: true, status: 'blocked' }
              : conn,
          ),
        );
        return true;
      }),
    );
  }

  // Méthode pour mettre à jour le statut en ligne d'un utilisateur
  updateUserStatus(status: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/status`, { online: status }, this.getHttpOptions()).pipe(
      catchError(error => {
        console.error('Erreur lors de la mise à jour du statut:', error);
        return throwError(() => new Error('Impossible de mettre à jour le statut'));
      })
    );
  }

  // Méthode pour changer le mot de passe
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    const payload = {
      oldPassword,
      newPassword
    };
    
    return this.http.post<any>(`${this.apiUrl}/users/change-password`, payload, this.getHttpOptions()).pipe(
      catchError(error => {
        console.error('Erreur lors du changement de mot de passe:', error);
        return throwError(() => new Error(error.error?.message || 'Impossible de changer le mot de passe'));
      })
    );
  }

  // Méthode pour obtenir les en-têtes HTTP avec le token JWT
  private getHttpOptions() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }
}
