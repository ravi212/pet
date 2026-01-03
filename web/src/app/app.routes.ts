import { Routes } from '@angular/router';
import { NotFound } from './shared/pages/not-found/not-found';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/pages/auth.routes').then((m) => m.authRoutes),
  },

  // default redirect
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

  // 404 temporary for now
  {
    path: '**',
    component: NotFound,
  },
];
