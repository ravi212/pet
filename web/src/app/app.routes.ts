import { Routes } from '@angular/router';
import { NotFound } from './shared/pages/not-found/not-found';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { AUTH_ROUTES, PROJECT_ROUTES, SETTINGS_ROUTES } from './shared/constants/routes.const';

export const routes: Routes = [
  // 🔓 Auth
  {
    path: AUTH_ROUTES.ROOT,
    canActivate: [guestGuard],
    loadChildren: () => import('./states/auth/auth.routes').then((m) => m.authRoutes),
  },

  {
    path: `${PROJECT_ROUTES.ROOT}`,
    canActivate: [authGuard],
    loadChildren: () => import('./states/project/project.routes').then((m) => m.projectRoutes),
  },

  {
    path: `${PROJECT_ROUTES.ROOT}/${PROJECT_ROUTES.ID}`,
    canActivate: [authGuard],
    loadChildren: () =>
      import('./states/project/workspace/workspace.routes').then((m) => m.projectFeatureRoutes),
  },

  {
    path: `${SETTINGS_ROUTES.ROOT}`,
    canActivate: [authGuard],
    loadChildren: () => import('./states/settings/settings.routes').then((m) => m.settingsRoutes),
  },

  // default
  {
    path: '',
    redirectTo: `${PROJECT_ROUTES.ROOT}`,
    pathMatch: 'full',
  },

  // 404
  {
    path: '**',
    component: NotFound,
  },
];
