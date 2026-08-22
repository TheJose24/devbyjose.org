import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./workspaces/inicio/inicio').then((m) => m.Inicio),
    title: 'jose@www.devbyjose.org',
  },
  {
    path: 'proyectos',
    loadComponent: () => import('./workspaces/proyectos/proyectos').then((m) => m.Proyectos),
    title: 'proyectos · www.devbyjose.org',
  },
  {
    path: 'homelab',
    loadComponent: () => import('./workspaces/homelab/homelab').then((m) => m.HomelabWs),
    title: 'homelab · www.devbyjose.org',
  },
  {
    path: 'notas',
    loadComponent: () => import('./workspaces/notas/notas').then((m) => m.Notas),
    title: 'notas · www.devbyjose.org',
  },
  {
    // `withComponentInputBinding` inyecta :slug en la entrada del componente.
    path: 'notas/:slug',
    loadComponent: () => import('./workspaces/notas/notas').then((m) => m.Notas),
    title: 'notas · www.devbyjose.org',
  },
  { path: '**', redirectTo: '' },
];
