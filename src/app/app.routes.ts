import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./workspaces/inicio/inicio').then((m) => m.Inicio),
    title: 'jose@devbyjose.org',
  },
  {
    path: 'proyectos',
    loadComponent: () => import('./workspaces/proyectos/proyectos').then((m) => m.Proyectos),
    title: 'proyectos · devbyjose.org',
  },
  {
    path: 'homelab',
    loadComponent: () => import('./workspaces/homelab/homelab').then((m) => m.HomelabWs),
    title: 'homelab · devbyjose.org',
  },
  {
    path: 'notas',
    loadComponent: () => import('./workspaces/notas/notas').then((m) => m.Notas),
    title: 'notas · devbyjose.org',
  },
  {
    // `withComponentInputBinding` inyecta :slug en la entrada del componente.
    path: 'notas/:slug',
    loadComponent: () => import('./workspaces/notas/notas').then((m) => m.Notas),
    title: 'notas · devbyjose.org',
  },
  { path: '**', redirectTo: '' },
];
