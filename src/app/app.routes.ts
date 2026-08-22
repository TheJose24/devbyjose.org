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
  { path: '**', redirectTo: '' },
];
