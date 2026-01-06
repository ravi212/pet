import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../states/auth/services/auth.service';
import { AUTH_ROUTES } from '../../shared/constants/routes.const';

export const authGuard: CanActivateFn = (_, __) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated()
    ? true
    : router.createUrlTree([`/${AUTH_ROUTES.ROOT}/${AUTH_ROUTES.LOGIN}`]);
};
