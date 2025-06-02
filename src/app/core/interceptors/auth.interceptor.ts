import {
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const router = inject(Router);
  
  // Récupérer le token depuis le localStorage
  const token = localStorage.getItem('accessToken');
  
  // Si nous avons un token et que la requête va vers notre API
  if (token && req.url.includes('/api')) {
    // Cloner la requête et ajouter le header d'autorisation
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    
    // Passer la requête modifiée au handler suivant
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Gérer les erreurs 401 (non autorisé) - token expiré ou invalide
        if (error.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
  
  // Si pas de token ou requête vers une autre API, passer la requête originale
  return next(req);
};
