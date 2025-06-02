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
import { RegisterRequest } from '../../core/models/auth.models';

@Component({
  selector: 'app-register',
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
          <p class="text-gray-600 mt-2">Créez votre compte</p>
        </div>

        <!-- Formulaire d'inscription -->
        <div class="card p-8">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
            
            <!-- Nom d'utilisateur -->
            <div class="form-group">
              <label for="username" class="form-label">
                Nom d'utilisateur
              </label>
              <div class="relative">
                <input
                  id="username"
                  type="text"
                  formControlName="username"
                  class="form-input pl-10"
                  [class.border-red-300]="usernameControl.invalid && usernameControl.touched"
                  [class.border-green-300]="usernameControl.valid && usernameControl.touched"
                  placeholder="votre_nom_utilisateur"
                  autocomplete="username">
                  
                <!-- Icône utilisateur -->
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z">
                    </path>
                  </svg>
                </div>
              </div>
              
              <!-- Messages d'erreur username -->
              <div *ngIf="usernameControl.invalid && usernameControl.touched" class="form-error">
                <span *ngIf="usernameControl.hasError('required')">
                  Le nom d'utilisateur est requis
                </span>
                <span *ngIf="usernameControl.hasError('minlength')">
                  Le nom d'utilisateur doit contenir au moins 3 caractères
                </span>
              </div>
            </div>

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
                  [class.border-red-300]="emailControl.invalid && emailControl.touched"
                  [class.border-green-300]="emailControl.valid && emailControl.touched"
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
              </div>
              
              <!-- Messages d'erreur email -->
              <div *ngIf="emailControl.invalid && emailControl.touched" class="form-error">
                <span *ngIf="emailControl.hasError('required')">
                  L'email est requis
                </span>
                <span *ngIf="emailControl.hasError('email')">
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
                  [class.border-red-300]="passwordControl.invalid && passwordControl.touched"
                  [class.border-green-300]="passwordControl.valid && passwordControl.touched"
                  placeholder="••••••••"
                  autocomplete="new-password">
                  
                <!-- Icône cadenas -->
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z">
                    </path>
                  </svg>
                </div>
                
                <!-- Bouton pour afficher/masquer le mot de passe -->
                <button 
                  type="button" 
                  (click)="togglePasswordVisibility()"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg *ngIf="!showPassword()" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  <svg *ngIf="showPassword()" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                  </svg>
                </button>
              </div>
              
              <!-- Messages d'erreur mot de passe -->
              <div *ngIf="passwordControl.invalid && passwordControl.touched" class="form-error">
                <span *ngIf="passwordControl.hasError('required')">
                  Le mot de passe est requis
                </span>
                <span *ngIf="passwordControl.hasError('minlength')">
                  Le mot de passe doit contenir au moins 8 caractères
                </span>
                <span *ngIf="passwordControl.hasError('pattern')">
                  Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial
                </span>
              </div>
            </div>

            <!-- Confirmer mot de passe -->
            <div class="form-group">
              <label for="confirmPassword" class="form-label">
                Confirmer le mot de passe
              </label>
              <div class="relative">
                <input
                  id="confirmPassword"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="confirmPassword"
                  class="form-input pl-10"
                  [class.border-red-300]="confirmPasswordControl.invalid && confirmPasswordControl.touched"
                  [class.border-green-300]="confirmPasswordControl.valid && confirmPasswordControl.touched"
                  placeholder="••••••••"
                  autocomplete="new-password">
                  
                <!-- Icône cadenas -->
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z">
                    </path>
                  </svg>
                </div>
              </div>
              
              <!-- Messages d'erreur confirmation mot de passe -->
              <div *ngIf="confirmPasswordControl.invalid && confirmPasswordControl.touched" class="form-error">
                <span *ngIf="confirmPasswordControl.hasError('required')">
                  La confirmation du mot de passe est requise
                </span>
                <span *ngIf="confirmPasswordControl.hasError('passwordMismatch')">
                  Les mots de passe ne correspondent pas
                </span>
              </div>
            </div>

            <!-- Message d'erreur général -->
            <div *ngIf="errorMessage()" class="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {{ errorMessage() }}
            </div>

            <!-- Bouton d'inscription -->
            <div>
              <button 
                type="submit" 
                class="btn btn-primary w-full flex justify-center items-center gap-2"
                [disabled]="loading()">
                <div *ngIf="loading()" class="animate-spin h-5 w-5 text-white">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                </div>
                
                {{ loading() ? 'Inscription en cours...' : 'Créer un compte' }}
              </button>
            </div>
          </form>

          <!-- Lien vers connexion -->
          <div class="mt-6 text-center border-t border-gray-200 pt-6">
            <p class="text-sm text-gray-600">
              Vous avez déjà un compte ?
              <a routerLink="/login" 
                 class="font-medium text-primary-600 hover:text-primary-500 transition-colors ml-1">
                Se connecter
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Signals
  readonly showPassword = signal(false);
  readonly errorMessage = signal('');
  readonly loading = this.authService.loading;

  // Formulaire d'inscription
  registerForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        ),
      ],
    ],
    confirmPassword: ['', [Validators.required]],
  }, { validators: this.passwordMatchValidator });

  // Getters pour les contrôles du formulaire
  get usernameControl() {
    return this.registerForm.get('username')!;
  }
  
  get emailControl() {
    return this.registerForm.get('email')!;
  }
  
  get passwordControl() {
    return this.registerForm.get('password')!;
  }
  
  get confirmPasswordControl() {
    return this.registerForm.get('confirmPassword')!;
  }

  // Validateur personnalisé pour vérifier que les mots de passe correspondent
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((show) => !show);
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.errorMessage.set('');

      const userData: RegisterRequest = {
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        confirmPassword: this.registerForm.value.confirmPassword,
        acceptTerms: true, // Adding this as it's required by the interface
      };

      this.authService.register(userData).subscribe({
        next: (response) => {
          if (response.success) {
            // Redirection vers la page de connexion après inscription réussie
            this.router.navigate(['/login'], { 
              queryParams: { registered: 'true' } 
            });
          }
        },
        error: (error) => {
          console.error('Erreur d\'inscription:', error);
          this.errorMessage.set(
            error.message ||
              'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.'
          );
        },
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.registerForm.controls).forEach((key) => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }
}
