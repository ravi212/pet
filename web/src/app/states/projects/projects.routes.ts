import { Routes } from '@angular/router';

export const projectsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../layouts/projects-layout/projects.layout')
        .then(m => m.ProjectsLayoutComponent),
    // children: [
    //   {
    //     path: '',
    //     loadComponent: () =>
    //       import('./project-list/project-list')
    //         .then(m => m.ProjectList),
    //   },
    //   {
    //     path: 'create',
    //     loadComponent: () =>
    //       import('./project-create/project-create')
    //         .then(m => m.ProjectCreate),
    //   },
    // ],
  },
];
