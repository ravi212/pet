import { Routes } from '@angular/router';

export const projectRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },

  // {
  //   path: 'dashboard',
  //   loadComponent: () =>
  //     import('./dashboard/dashboard.page')
  //       .then(m => m.DashboardPage),
  // },

  // {
  //   path: 'tasks',
  //   loadComponent: () =>
  //     import('./tasks/tasks.page')
  //       .then(m => m.TasksPage),
  // },

  // {
  //   path: 'expenses',
  //   loadComponent: () =>
  //     import('./expenses/expenses.page')
  //       .then(m => m.ExpensesPage),
  // },

  // {
  //   path: 'receipts',
  //   loadComponent: () =>
  //     import('./receipts/receipts.page')
  //       .then(m => m.ReceiptsPage),
  // },

  // {
  //   path: 'categories',
  //   loadComponent: () =>
  //     import('./categories/categories.page')
  //       .then(m => m.CategoriesPage),
  // },

  // {
  //   path: 'cycles',
  //   loadComponent: () =>
  //     import('./cycles/cycles.page')
  //       .then(m => m.CyclesPage),
  // },

  // {
  //   path: 'collaborators',
  //   loadComponent: () =>
  //     import('./collaborators/collaborators.page')
  //       .then(m => m.CollaboratorsPage),
  // },
];
