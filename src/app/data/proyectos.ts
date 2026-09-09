export interface Dato {
  readonly clave: string;
  readonly valor: string;
  readonly nota?: string;
  readonly acento?: boolean;
}

export interface Proyecto {
  readonly key: string;
  /** Nombre en el listado; la extensión insinúa la naturaleza del proyecto. */
  readonly archivo: string;
  readonly titulo: string;
  readonly resumen: string;
  readonly stack: string;
  readonly modificado: string;
  readonly enVivo?: boolean;
  readonly datos: readonly Dato[];
  /** La decisión técnica que lo hace interesante, no el listado de tecnologías. */
  readonly porQue: string;
  readonly repo?: string;
}

export const PROYECTOS: readonly Proyecto[] = [
  {
    key: 'healthyme',
    archivo: 'healthyme.ms',
    titulo: 'HealthyMe',
    resumen:
      'Proyecto académico parcialmente implementado con Java, Spring Boot y Angular, orientado a una arquitectura de microservicios para el dominio clínico.',
    stack: 'java 21 · spring boot · angular 17',
    modificado: '2025-07',
    datos: [
      { clave: 'alcance', valor: 'académico · parcial' },
      { clave: 'módulos', valor: '15 Maven', nota: '14 aplicaciones Spring Boot y una biblioteca compartida' },
      { clave: 'datos', valor: 'MySQL', nota: 'persistencia JPA verificada' },
      { clave: 'auth', valor: 'OAuth2 · OIDC · JWT', nota: 'implementada en código' },
      { clave: 'integraciones', valor: 'Stripe · Ollama' },
      { clave: 'mensajería', valor: 'Kafka', nota: 'integración parcial' },
      { clave: 'despliegue', valor: 'Docker Compose', nota: 'ejecución conjunta no verificada' },
      { clave: 'rol', valor: 'Full Stack' },
      { clave: 'año', valor: '2025', nota: 'abril — julio' },
    ],
    porQue:
      'El proyecto sirvió para practicar separación de dominios, configuración centralizada, descubrimiento y autenticación. La implementación quedó parcial y no se presenta como producto terminado ni como despliegue integral verificado.',
    repo: 'github.com/TheJose24/HealthyMe-Backend',
  },
  {
    key: 'euphony',
    archivo: 'euphony.svc',
    titulo: 'Euphony',
    resumen:
      'Proyecto académico de streaming iniciado en 2024 y retomado en 2026 para modernizar el frontend con Angular 21.',
    stack: 'java · spring boot · postgresql · angular 21',
    modificado: '2026-06',
    datos: [
      { clave: 'auth', valor: 'Keycloak · OAuth2/OIDC', nota: 'integral en la etapa original; reactivación moderna pendiente' },
      { clave: 'datos', valor: 'PostgreSQL' },
      { clave: 'frontend', valor: 'Angular 21', nota: 'zoneless · signals' },
      { clave: 'api', valor: 'Swagger / OpenAPI' },
      { clave: 'rol', valor: 'Jefe de proyecto (2024) · desarrollador (2026)' },
      { clave: 'etapas', valor: '2024 + 2026', nota: 'sin actividad significativa en 2025' },
    ],
    porQue:
      'La etapa original integró autenticación centralizada con Keycloak. En 2026 retomé el proyecto para modernizar el frontend con componentes standalone, Signals y ejecución zoneless; la integración moderna completa de autenticación sigue pendiente.',
    repo: 'github.com/TheJose24/EuphonyApp-Backend',
  },
  {
    key: 'homelab',
    archivo: 'homelab.infra',
    titulo: 'homelab.infra',
    resumen:
      'Infraestructura personal con virtualización, contenedores y publicación selectiva de servicios web sin port forwarding desde Internet.',
    stack: 'proxmox ve · linux · docker',
    modificado: '2026',
    datos: [
      { clave: 'hipervisor', valor: 'Proxmox VE' },
      { clave: 'invitados', valor: 'VM · LXC', nota: 'aislamiento según carga y ciclo de vida' },
      { clave: 'servicios', valor: 'Docker', nota: 'aplicaciones y herramientas personales' },
      { clave: 'operación', valor: 'servicios bajo demanda', nota: 'se encienden cuando se necesitan' },
      { clave: 'red', valor: 'Cloudflare Tunnel · Tailscale', nota: 'sin exposición directa de puertos WAN' },
      { clave: 'estado', valor: 'encendido a demanda', acento: true },
    ],
    porQue:
      'Los recursos son deliberadamente limitados, así que separo por aislamiento y ciclo de vida: los entornos de experimentación van en VM, los servicios ligeros y estables en LXC y las aplicaciones en Docker. Tailscale da acceso privado y Cloudflare Tunnel publica solo servicios web seleccionados.',
  },
];

export function buscarProyecto(termino: string): Proyecto | undefined {
  const t = termino.toLowerCase().replace(/\.(ms|svc|infra)$/, '');
  return PROYECTOS.find((p) => p.key === t) ?? PROYECTOS.find((p) => p.key.startsWith(t));
}
