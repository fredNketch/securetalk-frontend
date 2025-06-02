import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LoginRequest } from '../../core/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <!-- Logo et titre -->
        <div class="text-center mb-8">
          <div class="mx-auto h-16 w-16 bg-primary-500 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z">
              </path>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900">SecureTalk</h1>
          <p class="text-gray-600 mt-2">Connectez-vous à votre compte</p>
        </div>

        <!-- Formulaire de connexion -->
        <div class="card p-8">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            
            <!-- Email -->
            <div class="form-group">
              <label for="email" class="form-label">
                Adresse email
              </label>
              <div class="relative">
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="form-input pl-10"
                  [class.border-red-300]="emailControl?.invalid && emailControl?.touched"
                  [class.border-green-300]="emailControl?.valid && emailControl?.touched"
                  placeholder="vous@exemple.com"
                  autocomplete="email">
                  
                <!-- Icône email -->
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207">
                    </path>
                  </svg>
                </div>
                
                <!-- Icône de validation -->
                <div *ngIf="emailControl?.valid && emailControl?.touched" 
                     class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              
              <!-- Messages d'erreur email -->
              <div *ngIf="emailControl?.invalid && emailControl?.touched" class="form-error">
                <span *ngIf="emailControl?.hasError('required')">
                  L'email est requis
                </span>
                <span *ngIf="emailControl?.hasError('email')">
                  Format d'email invalide
                </span>
              </div>
            </div>

            <!-- Mot de passe -->
            <div class="form-group">
              <label for="password" class="form-label">
                Mot de passe
              </label>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  class="form-input pl-10 pr-10"
                  [class.border-red-300]="passwordControl?.invalid && passwordControl?.touched"
                  placeholder="Votre mot de passe"
                  autocomplete="current-password">
                  
                <!-- Icône cadenas -->
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z">
                    </path>
                  </svg>
                </div>
                
                <!-- Bouton toggle mot de passe -->
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  (click)="togglePasswordVisibility()">
                  <svg *ngIf="!showPassword()" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                    </path>
                  </svg>
                  <svg *ngIf="showPassword()" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21">
                    </path>
                  </svg>
                </button>
              </div>
              
              <!-- Messages d'erreur mot de passe -->
              <div *ngIf="passwordControl?.invalid && passwordControl?.touched" class="form-error">
                <span *ngIf="passwordControl?.hasError('required')">
                  Le mot de passe est requis
                </span>
                <span *ngIf="passwordControl?.hasError('minlength')">
                  Le mot de passe doit contenir au moins 8 caractères
                </span>
              </div>
            </div>

            <!-- Options -->
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  formControlName="rememberMe"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded">
                <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                  Se souvenir de moi
                </label>
              </div>
              <div class="text-sm">
                <a href="#" class="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <!-- Message d'erreur global -->
            <div *ngIf="errorMessage()" 
                 class="bg-red-50 border border-red-200 rounded-md p-4 transition-all duration-300">
              <div class="flex">
                <svg class="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                  </path>
                </svg>
                <div class="text-sm text-red-700">
                  {{ errorMessage() }}
                </div>
              </div>
            </div>

            <!-- Bouton de connexion -->
            <div>
              <button
                type="submit"
                [disabled]="loginForm.invalid || loading()"
                class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-all duration-200"
                [class.bg-primary-600]="!loading()"
                [class.hover:bg-primary-700]="!loading()"
                [class.bg-gray-400]="loading()"
                [class.cursor-not-allowed]="loginForm.invalid || loading()">
                
                <!-- Loading spinner -->
                <div *ngIf="loading()" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" 
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                </div>
                
                {{ loading() ? 'Connexion en cours...' : 'Se connecter' }}
              </button>
            </div>
          </form>

          <!-- Lien vers inscription -->
          <div class="mt-6 text-center border-t border-gray-200 pt-6">
            <p class="text-sm text-gray-600">
              Pas encore de compte ?
              <a routerLink="/register" 
                 class="font-medium text-primary-600 hover:text-primary-500 transition-colors ml-1">
                Créer un compte
              </a>
            </p>
          </div>
        </div>

        <!-- Comptes de démonstration -->
        <div class="mt-8 bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <h3 class="text-sm font-medium text-gray-700 mb-3 text-center">
            🧪 Comptes de démonstration
          </h3>
          <div class="grid grid-cols-1 gap-2 text-xs">
            <div class="bg-blue-50 p-3 rounded border border-blue-200">
              <strong class="text-blue-800">Admin:</strong>
              <div class="text-blue-600">admin&#64;securetalk.com / Admin123!</div>
            </div>
            <div class="bg-green-50 p-3 rounded border border-green-200">
              <strong class="text-green-800">Utilisateur:</strong>
              <div class="text-green-600">user&#64;securetalk.com / User123!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Signals
  readonly showPassword = signal(false);
  readonly errorMessage = signal('');
  readonly loading = this.authService.loading;

  // Formulaire de connexion
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [false],
  });

  // Getters pour les contrôles du formulaire
  get emailControl() {
    return this.loginForm.get('email');
  }
  get passwordControl() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((show) => !show);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.errorMessage.set('');
      console.log('Formulaire valide, tentative de connexion...');

      const credentials: LoginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
        rememberMe: this.loginForm.value.rememberMe,
      };

      console.log('Envoi des identifiants:', { email: credentials.email, rememberMe: credentials.rememberMe });

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Réponse reçue du serveur:', response);
          if (response.success) {
            console.log('Connexion réussie !', response.data.user);
            console.log('Token JWT reçu:', response.data.accessToken);
            
            // Rediriger vers la page des messages (route principale de l'application)
            try {
              console.log('Tentative de redirection vers /messages');
              this.router.navigate(['/messages']).then(success => {
                console.log('Redirection réussie?', success);
                if (!success) {
                  console.warn('Erreur de redirection, tentative vers la page d\'accueil');
                  this.router.navigate(['/']);
                }
              });
            } catch (e) {
              console.error('Erreur lors de la redirection:', e);
              // Redirection de secours vers la page d'accueil
              this.router.navigate(['/']);
            }
          } else {
            console.warn('Réponse reçue mais success=false:', response);
            this.errorMessage.set('Erreur de connexion: réponse invalide du serveur');
          }
        },
        error: (error) => {
          console.error('Erreur de connexion détaillée:', error);
          this.errorMessage.set(
            error.message ||
              'Email ou mot de passe incorrect. Veuillez réessayer.',
          );
        },
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  // Méthode utilitaire pour remplir rapidement les champs (développement)
  fillDemo(type: 'admin' | 'user'): void {
    if (type === 'admin') {
      this.loginForm.patchValue({
        email: 'admin@securetalk.com',
        password: 'Admin123!',
      });
    } else {
      this.loginForm.patchValue({
        email: 'user@securetalk.com',
        password: 'User123!',
      });
    }
  }
}
