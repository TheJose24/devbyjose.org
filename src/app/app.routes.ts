import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./workspaces/inicio/inicio').then((m) => m.Inicio),
    title: 'jose@www.devbyjose.org',
  },
  { path: '**', redirectTo: '' },
];
