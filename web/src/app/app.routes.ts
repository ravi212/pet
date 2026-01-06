import { Routes } from '@angular/router';
import { NotFound } from './shared/pages/not-found/not-found';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // 🔓 Auth
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () => import('./layouts/auth-layout/auth.layout').then((m) => m.AuthLayoutComponent),
    loadChildren: () => import('./states/auth/auth.routes').then((m) => m.authRoutes),
  },

  {
    path: 'projects',
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
    redirectTo: 'projects',
    pathMatch: 'full',
  },

  // 404
  {
    path: '**',
    component: NotFound,
  },
];
