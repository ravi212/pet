import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../states/auth/services/auth.service';
import { PROJECT_ROUTES } from '../../shared/constants/routes.const';

export const guestGuard: CanActivateFn = (_, __) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated()
    ? router.createUrlTree([`/${PROJECT_ROUTES.ROOT}/${PROJECT_ROUTES.LIST}`])
    : true;
};
