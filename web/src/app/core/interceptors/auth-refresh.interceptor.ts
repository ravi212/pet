import { HttpInterceptorFn, HttpErrorResponse, HttpEvent, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../../states/auth/services/auth.service';


let isRefreshing = false;

export const authRefreshInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

const ignoreUrls = ['/auth/login', '/auth/signup', '/auth/refresh-token', '/auth/me'];

return next(req).pipe(
  catchError((error: HttpErrorResponse) => {
    if (
      error.status !== 401 ||
      ignoreUrls.some(url => req.url.includes(url)) ||
      !authService.isAuthenticated()
    ) {
      return throwError(() => error);
    }

    if (!isRefreshing) {
      isRefreshing = true;
      return authService.refreshToken().pipe(
        switchMap(() => {
          isRefreshing = false;
          return next(req);
        }),
        catchError(err => {
          isRefreshing = false;
          authService.logout();
          return throwError(() => err);
        })
      );
    }

    return throwError(() => error);
  })
);

};
