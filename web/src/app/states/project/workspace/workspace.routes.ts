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
      { path: `${PROJECT_ROUTES.EXPENSES}/${PROJECT_ROUTES.LIST}`, loadComponent: () => import('./expenses/list/list').then(m => m.List) },
      { path: `${PROJECT_ROUTES.RECEIPTS}/${PROJECT_ROUTES.LIST}`, loadComponent: () => import('./receipts/list/list').then(m => m.List) },
      { path: `${PROJECT_ROUTES.CYCLES}/${PROJECT_ROUTES.LIST}`, loadComponent: () => import('./cycles/list').then(m => m.List) },
      { path: `${PROJECT_ROUTES.TASKS}/${PROJECT_ROUTES.LIST}`, loadComponent: () => import('./tasks/list').then(m => m.List) },
      { path: `${PROJECT_ROUTES.SETTINGS}`, loadComponent: () => import('./settings/settings').then(m => m.SettingsComponent) },
    ],
  },
];
