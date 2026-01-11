import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../states/auth/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

export const authRefreshInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const route = inject(ActivatedRoute)
  const ignored = ['/auth/login', '/auth/signup', '/auth/refresh'];

  if (ignored.some((url) => req.url.includes(url))) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // const hasAuthHeader = req.headers.has('Authorization');

      // if (!hasAuthHeader && !router.url.includes('/signup')) {
      //   return throwError(() => error);
      // }

      // already tried refresh once → logout
      if ((req as any)._retry) {
        authService.clearAuth();
        router.navigate(['/auth/login']);
        return throwError(() => error);
      }

      // mark request as retried
      const retryReq = req.clone() as any;
      retryReq._retry = true;

      return authService.refreshToken().pipe(
        switchMap(() => next(retryReq)),
        catchError((refreshErr) => {
          // refresh failed → logout immediately
          authService.clearAuth();
          router.navigate(['/auth/login']);
          return throwError(() => refreshErr);
        })
      );
    })
  );
};
