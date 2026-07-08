import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'task-list',
    loadComponent: () =>
      import('./features/task-list/task-list.page').then((m) => m.TaskListPage),
  },
  {
    path: '',
    redirectTo: 'task-list',
    pathMatch: 'full',
  },
];
