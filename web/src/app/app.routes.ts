import { Routes } from '@angular/router';
import { NotFound } from './shared/pages/not-found/not-found';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { AUTH_ROUTES, PROJECTS_ROUTES } from './shared/constants/routes.const';

export const routes: Routes = [
  // 🔓 Auth
  {
    path: AUTH_ROUTES.ROOT,
    canActivate: [guestGuard],
    loadComponent: () => import('./layouts/auth-layout/auth.layout').then((m) => m.AuthLayoutComponent),
    loadChildren: () => import('./states/auth/auth.routes').then((m) => m.authRoutes),
  },

  {
    path: `${PROJECTS_ROUTES.ROOT}/${PROJECTS_ROUTES.LIST}`,
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/projects-layout/projects.layout').then((m) => m.ProjectsLayoutComponent),
    loadChildren: () => import('./states/projects/projects.routes').then((m) => m.projectsRoutes),
  },

  {
    path: 'project/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/project-layout/project.layout').then((m) => m.ProjectLayoutComponent),
    loadChildren: () => import('./states/project/project.routes').then((m) => m.projectRoutes),
  },

  // default
  {
    path: '',
    redirectTo: `${PROJECTS_ROUTES.ROOT}/${PROJECTS_ROUTES.LIST}`,
    pathMatch: 'full',
  },

  // 404
  {
    path: '**',
    component: NotFound,
  },
];
