import { Routes } from '@angular/router';
import { PROJECT_ROUTES } from '../../../shared/constants/routes.const';

export const projectFeatureRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./workspace.layout')
        .then(m => m.ProjectFeaturesLayoutComponent),
    children: [
      { path: '', redirectTo: PROJECT_ROUTES.DASHBOARD, pathMatch: 'full' },
      { path: PROJECT_ROUTES.DASHBOARD, loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) },
      { path: PROJECT_ROUTES.EXPENSES, loadComponent: () => import('./expenses/expenses').then(m => m.Expenses) },
      { path: PROJECT_ROUTES.CYCLES, loadComponent: () => import('./cycles/cycles').then(m => m.Cycles) },
      { path: PROJECT_ROUTES.TASKS, loadComponent: () => import('./tasks/tasks').then(m => m.Tasks) },
    ],
  },
];
