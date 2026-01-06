import { Routes } from '@angular/router';
import { PROJECTS_ROUTES } from '../../shared/constants/routes.const';

export const projectsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../layouts/projects-layout/projects.layout').then(
        (m) => m.ProjectsLayoutComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: `${PROJECTS_ROUTES.ROOT}/${PROJECTS_ROUTES.LIST}`,
      },
      {
        path: ``,
        loadComponent: () => import('./pages/list/list').then((m) => m.ProjectListComponent),
      },
      // {
      //   path: 'create',
      //   loadComponent: () =>
      //     import('./project-create/project-create')
      //       .then(m => m.ProjectCreate),
      // },
    ],
  },
];
