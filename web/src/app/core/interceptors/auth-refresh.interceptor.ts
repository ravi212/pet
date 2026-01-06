import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpEvent,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  Observable,
  throwError,
  BehaviorSubject,
  filter,
  take,
  switchMap,
  catchError,
} from 'rxjs';
import { AuthService } from '../../states/auth/services/auth.service';
import { Router } from '@angular/router';

let isRefreshing = false;
const refreshDone$ = new BehaviorSubject<boolean | null>(null);

export const authRefreshInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const ignoreUrls = [
    '/auth/login',
    '/auth/signup',
    '/auth/refresh-token',
    '/auth/me',
  ];

  if (ignoreUrls.some(url => req.url.includes(url))) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (isRefreshing) {
        return refreshDone$.pipe(
          filter(v => v === true),
          take(1),
          switchMap(() => next(req))
        );
      }

      isRefreshing = true;
      refreshDone$.next(null);

      return authService.refreshToken().pipe(
        switchMap(() => authService.checkAuth()),
        switchMap(() => {
          isRefreshing = false;
          refreshDone$.next(true);
          return next(req);
        }),
        catchError(err => {
          isRefreshing = false;
          refreshDone$.next(false);

          authService.logout().subscribe();
          router.navigate(['/auth/login']);

          return throwError(() => err);
        })
      );
    })
  );
};
