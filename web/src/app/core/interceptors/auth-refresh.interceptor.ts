import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../states/auth/services/auth.service';
import { Router } from '@angular/router';

export const authRefreshInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // APIs that should NEVER trigger refresh logic
  const ignoredEndpoints = [
    '/auth/login',
    '/auth/signup',
    '/auth/refresh',
  ];

  if (ignoredEndpoints.some((url) => req.url.includes(url))) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only care about 401
      if (error.status !== 401) {
        return throwError(() => error);
      }

      /**
       * 🔑 CRITICAL:
       * If user is NOT authenticated, do NOTHING.
       * Guest routes (login/signup) must NEVER refresh or redirect.
       */
      if (!authService.isAuthenticated()) {
        return throwError(() => error);
      }

      /**
       * If we already tried refreshing once and still got 401,
       * tokens are invalid → force logout.
       */
      if ((req as any)._retry) {
        authService.clearAuth();
        router.navigate(['/auth/login']);
        return throwError(() => error);
      }

      /**
       * Mark request so we don't infinite-loop
       */
      const retryReq = req.clone() as any;
      retryReq._retry = true;

      /**
       * Attempt refresh
       */
      return authService.refreshToken().pipe(
        switchMap(() => next(retryReq)),
        catchError(() => {
          // Refresh failed → logout hard
          authService.clearAuth();
          router.navigate(['/auth/login']);
          return throwError(() => error);
        })
      );
    })
  );
};
