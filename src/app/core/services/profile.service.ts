import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map, tap } from 'rxjs';
import {
  ProfileUpdateRequest,
  PasswordChangeRequest,
  NotificationSettings,
  PrivacySettings,
  SecuritySettings,
  AvatarUploadResponse,
} from '../models/profile.models';
import { User } from '../models/user.models';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly apiUrl = 'http://localhost:8080/api';

  // Signals pour l'état du profil
  private readonly _notificationSettings = signal<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    messageNotifications: true,
    connectionNotifications: true,
    systemNotifications: false,
    soundEnabled: true,
    vibrationEnabled: true,
  });

  private readonly _privacySettings = signal<PrivacySettings>({
    isPrivate: false,
    allowMessages: true,
    showOnlineStatus: true,
    showLastSeen: true,
    allowSearch: true,
  });

  private readonly _securitySettings = signal<SecuritySettings>({
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: 30,
    allowMultipleSessions: true,
  });

  private readonly _loading = signal(false);

  // Computed values publics
  readonly notificationSettings = this._notificationSettings.asReadonly();
  readonly privacySettings = this._privacySettings.asReadonly();
  readonly securitySettings = this._securitySettings.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.loadSettings();
  }

  // Mettre à jour le profil
  updateProfile(updates: ProfileUpdateRequest): Observable<User> {
    this._loading.set(true);

    return of(null).pipe(
      delay(800),
      tap(() => {
        // Mettre à jour l'utilisateur actuel dans AuthService
        const currentUser = this.authService.currentUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates };
          // TODO: Update in AuthService
          console.log('Profile updated:', updatedUser);
        }
        this._loading.set(false);
      }),
      map(() => {
        // Assurer que l'objet retourné est bien un User complet avec toutes les propriétés requises
        const currentUser = this.authService.currentUser();
        if (!currentUser) {
          // Créer un User par défaut si aucun utilisateur n'est connecté (cas improbable)
          return {
            id: 0,
            username: '',
            email: '',
            roles: [],
            enabled: true,
            isOnline: false,
            createdAt: new Date(),
            isPrivate: false,
            allowMessages: true,
            showOnlineStatus: true
          } as User;
        }
        
        // Convertir explicitement UserDto en User en ajoutant les propriétés manquantes
        return {
          ...currentUser,
          // Convertir les rôles de string[] à UserRole[] si nécessaire
          roles: Array.isArray(currentUser.roles) && typeof currentUser.roles[0] === 'string' 
            ? (currentUser.roles as string[]).map(role => ({ id: 0, name: role as any })) 
            : currentUser.roles,
          // Ajouter les propriétés manquantes dans UserDto mais requises dans User
          isPrivate: (currentUser as any).isPrivate ?? false,
          allowMessages: (currentUser as any).allowMessages ?? true,
          showOnlineStatus: (currentUser as any).showOnlineStatus ?? true
        } as User;
      }),
    );

    // Version réelle :
    // return this.http.put<User>(`${this.apiUrl}/profile`, updates);
  }

  // Changer le mot de passe
  changePassword(request: PasswordChangeRequest): Observable<boolean> {
    this._loading.set(true);

    // Validation côté client
    if (request.newPassword !== request.confirmPassword) {
      throw new Error('Les mots de passe ne correspondent pas');
    }

    if (request.newPassword.length < 8) {
      throw new Error(
        'Le nouveau mot de passe doit contenir au moins 8 caractères',
      );
    }

    return of(true).pipe(
      delay(1000),
      tap(() => this._loading.set(false)),
    );

    // Version réelle :
    // return this.http.post<boolean>(`${this.apiUrl}/profile/change-password`, request);
  }

  // Upload d'avatar
  uploadAvatar(file: File): Observable<AvatarUploadResponse> {
    this._loading.set(true);

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier doit être une image');
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      throw new Error("L'image ne doit pas dépasser 5MB");
    }

    // Simulation d'upload
    return of(null).pipe(
      delay(2000),
      map(() => {
        const mockResponse: AvatarUploadResponse = {
          success: true,
          avatarUrl: URL.createObjectURL(file),
          message: 'Avatar mis à jour avec succès',
        };
        this._loading.set(false);
        return mockResponse;
      }),
    );

    // Version réelle :
    // const formData = new FormData();
    // formData.append('avatar', file);
    // return this.http.post<AvatarUploadResponse>(`${this.apiUrl}/profile/avatar`, formData);
  }

  // Supprimer l'avatar
  removeAvatar(): Observable<boolean> {
    this._loading.set(true);

    return of(true).pipe(
      delay(500),
      tap(() => this._loading.set(false)),
    );
  }

  // Paramètres de notification
  updateNotificationSettings(
    settings: NotificationSettings,
  ): Observable<NotificationSettings> {
    this._loading.set(true);

    return of(settings).pipe(
      delay(500),
      tap((newSettings) => {
        this._notificationSettings.set(newSettings);
        this._loading.set(false);
      }),
    );
  }

  // Paramètres de confidentialité
  updatePrivacySettings(
    settings: PrivacySettings,
  ): Observable<PrivacySettings> {
    this._loading.set(true);

    return of(settings).pipe(
      delay(500),
      tap((newSettings) => {
        this._privacySettings.set(newSettings);
        this._loading.set(false);
      }),
    );
  }

  // Paramètres de sécurité
  updateSecuritySettings(
    settings: SecuritySettings,
  ): Observable<SecuritySettings> {
    this._loading.set(true);

    return of(settings).pipe(
      delay(500),
      tap((newSettings) => {
        this._securitySettings.set(newSettings);
        this._loading.set(false);
      }),
    );
  }

  // Activer/désactiver 2FA
  toggle2FA(enable: boolean): Observable<boolean> {
    this._loading.set(true);

    return of(enable).pipe(
      delay(1000),
      tap((enabled) => {
        this._securitySettings.update((settings) => ({
          ...settings,
          twoFactorEnabled: enabled,
        }));
        this._loading.set(false);
      }),
    );
  }

  // Charger tous les paramètres
  private loadSettings(): void {
    // Simulation du chargement des paramètres
    // En réalité, ces données viendraient de l'API
    setTimeout(() => {
      // Les paramètres par défaut sont déjà définis dans les signals
    }, 100);
  }

  // Obtenir l'activité du profil
  getProfileActivity(): Observable<any[]> {
    const mockActivity = [
      {
        id: 1,
        type: 'profile_updated',
        description: 'Profil mis à jour',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 2,
        type: 'password_changed',
        description: 'Mot de passe modifié',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: 3,
        type: 'avatar_updated',
        description: 'Avatar mis à jour',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ];

    return of(mockActivity).pipe(delay(400));
  }
}
