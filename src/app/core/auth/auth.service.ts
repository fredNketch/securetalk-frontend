import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError, tap, catchError, map } from 'rxjs';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserDto,
} from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'https://localhost:8443/api'; // Backend Spring Boot avec HTTPS
  // Si vous rencontrez des problèmes avec HTTPS, essayez cette URL alternative
  // private readonly apiUrl = 'http://localhost:8080/api'; // Version HTTP pour le développement

  // Signals pour l'état d'authentification
  private readonly _currentUser = signal<UserDto | null>(null);
  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _loading = signal<boolean>(false);

  // Computed values publics
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAdmin = computed(
    () => this._currentUser()?.roles.includes('ADMIN') ?? false,
  );
  readonly userInitials = computed(() => {
    const user = this._currentUser();
    if (!user) return '';
    return (
      (user.firstName?.[0] || '') +
      (user.lastName?.[0] || user.username[0] || '')
    );
  });

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private tokenExpirationTimer: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    // Charger l'utilisateur depuis le stockage local au démarrage
    const user = this.loadUserFromStorage();

    // Si un utilisateur est chargé, vérifier si le token est toujours valide
    if (user) {
      this.setupAutoLogout();
    }
  }

  // Connexion utilisateur
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this._loading.set(true);

    // Adapter les données pour le backend Spring Boot
    // IMPORTANT: Le backend s'attend à recevoir le nom d'utilisateur dans le champ 'username'
    // et non l'email. Si vous vous connectez avec l'email, assurez-vous d'utiliser
    // l'email qui correspond au nom d'utilisateur enregistré.
    const loginData = {
      username: credentials.email, // Le backend cherche cette valeur dans la colonne 'username'
      password: credentials.password,
    };

    return this.http
      .post<any>(`${this.apiUrl}/auth/signin`, loginData, this.getHttpOptions())
      .pipe(
        map((response) => {
          console.log('Réponse brute du serveur:', response);

          // Transformer la réponse du backend Spring Boot en AuthResponse
          const authResponse: AuthResponse = {
            success: true, // Forcer success à true si nous avons reçu une réponse valide
            data: {
              accessToken: response.accessToken,
              refreshToken: response.accessToken, // Le backend n'utilise pas de refresh token pour l'instant
              tokenType: response.tokenType,
              expiresIn: 3600, // Valeur par défaut
              user: {
                id: response.id,
                username: response.username,
                email: response.email,
                roles: response.roles,
                enabled: true,
                createdAt: new Date().toISOString(),
                isOnline: true,
              },
            },
          };

          // Stocker les données d'authentification
          this.storeAuthData(authResponse.data);
          this._currentUser.set(authResponse.data.user);
          this._isAuthenticated.set(true);
          this._loading.set(false);

          return authResponse;
        }),
        catchError((error) => {
          this._loading.set(false);
          return throwError(
            () => new Error(error.error?.message || 'Échec de la connexion'),
          );
        }),
      );
  }

  // Inscription utilisateur
  register(
    userData: RegisterRequest,
  ): Observable<{ success: boolean; data: UserDto }> {
    this._loading.set(true);

    // Adapter les données pour le backend Spring Boot
    const signupData = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role: ['user'], // Rôle par défaut
    };

    return this.http
      .post<any>(
        `${this.apiUrl}/auth/signup`,
        signupData,
        this.getHttpOptions(),
      )
      .pipe(
        map((response) => {
          // Créer un objet UserDto à partir de la réponse
          const userDto: UserDto = {
            id: 0, // L'ID sera attribué lors de la connexion
            username: userData.username,
            email: userData.email,
            roles: ['USER'],
            enabled: true,
            createdAt: new Date().toISOString(),
            isOnline: false,
          };

          this._loading.set(false);
          return { success: true, data: userDto };
        }),
        catchError((error) => {
          this._loading.set(false);
          return throwError(
            () => new Error(error.error?.message || "Échec de l'inscription"),
          );
        }),
      );
  }

  // Déconnexion
  logout(navigateToLogin: boolean = true): void {
    // Appeler le endpoint de déconnexion du backend
    const token = this.getToken();
    if (token) {
      this.http
        .post(
          `${this.apiUrl}/auth/signout`,
          {},
          {
            headers: new HttpHeaders({
              Authorization: `Bearer ${token}`,
            }),
          },
        )
        .subscribe({
          next: () => {
            this.clearAuthData();
            this._currentUser.set(null);
            this._isAuthenticated.set(false);
            if (navigateToLogin) {
              this.router.navigate(['/login']);
            }
          },
          error: () => {
            // Même en cas d'erreur, déconnecter l'utilisateur localement
            this.clearAuthData();
            this._currentUser.set(null);
            this._isAuthenticated.set(false);
            if (navigateToLogin) {
              this.router.navigate(['/login']);
            }
          },
        });
    } else {
      this.clearAuthData();
      this._currentUser.set(null);
      this._isAuthenticated.set(false);
      if (navigateToLogin) {
        this.router.navigate(['/login']);
      }
    }
  }

  // Méthodes utilitaires pour l'authentification
  public getHttpOptions(): { headers: HttpHeaders } {
    const token = this.getToken();
    console.log("Token utilisé pour l'API:", token); // DEBUG
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  // Gestion du stockage local
  private storeAuthData(authData: AuthResponse['data']): void {
    localStorage.setItem(this.TOKEN_KEY, authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authData.user));

    // Configurer la déconnexion automatique
    this.setupAutoLogout(3600); // 1 heure par défaut
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('refreshToken');
    localStorage.removeItem(this.USER_KEY);

    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }

  private loadUserFromStorage(): UserDto | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this._currentUser.set(user);
        this._isAuthenticated.set(true);
        return user;
      } catch (e) {
        console.error('Erreur lors du parsing des données utilisateur:', e);
        this.clearAuthData();
      }
    }
    return null;
  }

  // Configurer la déconnexion automatique
  private setupAutoLogout(expiresIn: number = 3600): void {
    // Annuler le minuteur existant
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    // Convertir la durée en millisecondes (avec une marge de sécurité de 60 secondes)
    const expiresInMs = (expiresIn - 60) * 1000;

    if (expiresInMs > 0) {
      this.tokenExpirationTimer = setTimeout(() => {
        this.logout(false);
      }, expiresInMs);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY); // ou 'auth_token'
  }

  hasRole(role: string): boolean {
    return this._currentUser()?.roles.includes(role) ?? false;
  }
}
