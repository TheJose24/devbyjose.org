import { Injectable, signal } from '@angular/core';

export interface HomelabService {
  readonly name: string;
  readonly detail: string;
}

export interface HomelabStatus {
  readonly services: readonly HomelabService[];
}

/**
 * Vista pública deliberadamente generalizada. El estado operativo detallado,
 * las capacidades, los identificadores y la lista real de servicios no forman
 * parte del sitio público.
 */
@Injectable({ providedIn: 'root' })
export class Homelab {
  private static readonly PUBLIC_STATUS: HomelabStatus = {
    services: [
      { name: 'virtualización', detail: 'Proxmox VE · VM/LXC' },
      { name: 'contenedores', detail: 'Docker · servicios bajo demanda' },
      { name: 'acceso privado', detail: 'Tailscale' },
      { name: 'publicación web', detail: 'Cloudflare Tunnel · subdominios seleccionados' },
    ],
  };

  readonly status = signal<HomelabStatus>(Homelab.PUBLIC_STATUS);
}
