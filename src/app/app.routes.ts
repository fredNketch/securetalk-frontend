import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
// import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Redirection par défaut
  {
    path: '',
    redirectTo: '/messages',
    pathMatch: 'full',
  },

  // Routes d'authentification (publiques)
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((c) => c.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register.component').then(
        (c) => c.RegisterComponent,
      ),
  },

  // Routes protégées avec layout
  {
    path: '',
    loadComponent: () =>
      import('./layout/components/app-layout.component').then(
        (c) => c.AppLayoutComponent,
      ),
    canActivate: [AuthGuard],
    children: [
      // Route du tableau de bord - commentée car non utilisée dans la version simplifiée
      // {
      //   path: 'dashboard',
      //   loadComponent: () =>
      //     import('./features/dashboard/dashboard.component').then(
      //       (c) => c.DashboardComponent,
      //     ),
      // },
      // Routes de messagerie - fonctionnalité principale de l'application
      {
        path: 'messages',
        loadComponent: () =>
          import('./features/messaging/messaging.component').then(
            (c) => c.MessagingComponent,
          ),
      },
      {
        path: 'messages/:conversationId',
        loadComponent: () =>
          import('./features/messaging/messaging.component').then(
            (c) => c.MessagingComponent,
          ),
      },
      // Routes utilisateurs - commentées car non utilisées dans la version simplifiée
      // {
      //   path: 'users',
      //   loadComponent: () =>
      //     import('./features/users/users.component').then(
      //       (c) => c.UsersComponent,
      //     ),
      // },
      // Routes de profil - commentées car non utilisées dans la version simplifiée
      // {
      //   path: 'profile',
      //   loadComponent: () =>
      //     import('./features/users/profile.component').then(
      //       (c) => c.ProfileComponent,
      //     ),
      // },
      // Routes de paramètres - commentées car non utilisées dans la version simplifiée
      // {
      //   path: 'settings',
      //   loadComponent: () =>
      //     import('./features/settings/settings.component').then(
      //       (c) => c.SettingsComponent,
      //     ),
      // },

      // Routes admin - commentées car non utilisées dans la version simplifiée
      // {
      //   path: 'admin',
      //   canActivate: [AdminGuard],
      //   children: [
      //     {
      //       path: '',
      //       redirectTo: 'dashboard',
      //       pathMatch: 'full',
      //     },
      //     {
      //       path: 'dashboard',
      //       loadComponent: () =>
      //         import('./features/admin/admin-dashboard.component').then(
      //           (c) => c.AdminDashboardComponent,
      //         ),
      //     },
      //     // Autres routes admin commentées
      //   ],
      // },
    ],
  },

  // Wildcard route
  {
    path: '**',
    redirectTo: '/messages',
  },
];
