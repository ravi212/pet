import { Routes } from '@angular/router';
import { SETTINGS_ROUTES } from '../../shared/constants/routes.const';

export const settingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./settings.layout').then((m) => m.SettingsLayoutComponent),
    children: [
      // Redirect root to projects list
      {
        path: '',
        pathMatch: 'full',
        redirectTo: SETTINGS_ROUTES.ROOT,
      },
      {
        path: SETTINGS_ROUTES.ROOT,
        loadComponent: () =>
          import('./settings.component').then((m) => m.SettingsComponent),
      },
    ]
  },
];
