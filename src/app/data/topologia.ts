export type Tono = 'ok' | 'hi' | 'blu' | 'dim';

export interface Nodo {
  /** Los caracteres de árbol que dibujan la jerarquía. */
  readonly rama: string;
  readonly texto: string;
  readonly tono?: Tono;
  /** Columna derecha, alineada por CSS y no con espacios. */
  readonly nota?: string;
}

/**
 * Representación pública y generalizada del homelab. Omite identificadores,
 * capacidades y nombres internos. Se modela como datos y no como una cadena
 * con HTML dentro para poder colorear cada nodo sin recurrir a innerHTML.
 *
 * El árbol describe únicamente la arquitectura publicable; no representa el
 * estado operativo ni consulta datos en vivo.
 */
export const TOPOLOGIA: readonly Nodo[] = [
  { rama: '  ', texto: 'internet', tono: 'dim' },
  { rama: '     ╎', texto: '' },
  { rama: '     ▼', texto: '' },
  { rama: '  ', texto: 'proxmox-ve', tono: 'hi', nota: 'hipervisor · virtualización personal' },
  { rama: '  │', texto: '' },
  { rama: '  ├── ', texto: 'cloudflared', tono: 'ok', nota: 'servicio systemd · sin port forwarding desde Internet' },
  { rama: '  │', texto: '' },
  { rama: '  ├── ', texto: 'vm linux', tono: 'hi', nota: 'aplicaciones y servicios aislados' },
  { rama: '  │   └── ', texto: 'docker', tono: 'blu' },
  { rama: '  │       ├── ', texto: 'proxy', tono: 'ok', nota: 'enrutamiento web · certificados' },
  { rama: '  │       └── ', texto: 'servicios', tono: 'ok', nota: 'aplicaciones y herramientas personales' },
  { rama: '  │', texto: '' },
  { rama: '  ├── ', texto: 'lxc', tono: 'hi', nota: 'dns · tailscale · acceso remoto privado' },
  { rama: '  │', texto: '' },
  { rama: '  └── ', texto: 'vm / lxc', tono: 'dim', nota: 'plantillas y entornos de prueba bajo demanda' },
];
