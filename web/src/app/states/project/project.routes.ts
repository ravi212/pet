import { Routes } from '@angular/router';
import { PROJECT_ROUTES } from '../../shared/constants/routes.const';

export const projectRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./project.layout').then((m) => m.ProjectLayoutComponent),
    children: [
      // Redirect root to projects list
      {
        path: '',
        pathMatch: 'full',
        redirectTo: PROJECT_ROUTES.LIST,
      },

      {
        path: PROJECT_ROUTES.LIST,
        loadComponent: () => import('./list/list').then((m) => m.ProjectListComponent),
      },

      // // Projects list page
      // {
      //   path: PROJECTS_ROUTES.LIST,
      //   loadComponent: () =>
      //     import('./pages/list/list').then((m) => m.ProjectListComponent),
      // },

      // // Create project page
      // {
      //   path: PROJECTS_ROUTES.CREATE,
      //   loadComponent: () =>
      //     import('./pages/create/create-project.component').then(
      //       (m) => m.CreateProjectComponent
      //     ),
      // },

      // // Project detail page (lazy-load submodules like expenses, dashboard, tasks)
      // {
      //   path: PROJECTS_ROUTES.DETAIL,
      //   loadChildren: () =>
      //     import('./pages/detail/project-detail.module').then(
      //       (m) => m.ProjectDetailModule
      //     ),
      // },
    ],
  },
];
