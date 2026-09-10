export interface ProjectLink {
  readonly label: string;
  readonly url: string;
  readonly external?: boolean;
}

export interface Proyecto {
  readonly key: string;
  readonly archivo: string;
  readonly titulo: string;
  readonly tipo: string;
  readonly estado: 'Activo' | 'Modernizado en 2026' | 'Implementación parcial' | 'Operación bajo demanda';
  readonly periodo: string;
  readonly resumen: string;
  readonly problema: string;
  readonly contribucion: string;
  readonly decisiones: readonly string[];
  readonly implementacion: readonly string[];
  readonly resultado: readonly string[];
  readonly limites: readonly string[];
  readonly stack: readonly string[];
  readonly evidencia: readonly ProjectLink[];
}

export const PROYECTOS: readonly Proyecto[] = [
  {
    key: 'devbyjose',
    archivo: 'devbyjose.org',
    titulo: 'devbyjose.org',
    tipo: 'Proyecto personal',
    estado: 'Activo',
    periodo: '2026 — actualidad',
    resumen:
      'Portafolio personal construido con Angular y servicios de Cloudflare, con contenido técnico, contacto funcional y pruebas automatizadas.',
    problema:
      'Crear un portafolio técnico propio con una identidad diferenciada, contenido profesional estático y un canal de contacto funcional.',
    contribucion:
      'Diseñé la experiencia, definí la arquitectura e implementé y desplegué el sitio y su Worker de contacto.',
    decisiones: [
      'Angular 22 y TypeScript con Signals y detección de cambios zoneless.',
      'Prerender estático para entregar las rutas públicas como HTML listo para consumir.',
      'Worker de Cloudflare separado para aislar el procesamiento del formulario de contacto.',
      'Lenguaje visual de terminal y window manager, acompañado de navegación semántica, accesibilidad y responsive.',
    ],
    implementacion: [
      'Aplicación Angular con contenido profesional centralizado en módulos de datos.',
      'Tres rutas prerenderizadas durante el build de producción.',
      'Suite automatizada para la aplicación y para el Worker independiente.',
      'Flujo de contacto disponible mediante enlaces directos y terminal interactiva.',
    ],
    resultado: [
      'Portafolio operativo con identidad técnica propia y recorrido profesional recruiter-first.',
      'Worker de contacto desacoplado y contenido reutilizable sin duplicar claims en las vistas.',
    ],
    limites: [
      'Proyecto activo, desarrollado por fases y sujeto a evolución continua.',
    ],
    stack: ['Angular 22', 'TypeScript', 'Signals', 'Zoneless', 'Prerender', 'Cloudflare Workers', 'Vitest'],
    evidencia: [
      { label: 'Ver sitio', url: 'https://www.devbyjose.org', external: true },
      { label: 'Repositorio', url: 'https://github.com/TheJose24/devbyjose.org', external: true },
    ],
  },
  {
    key: 'euphony',
    archivo: 'euphony.svc',
    titulo: 'Euphony',
    tipo: 'Proyecto académico · modernización personal',
    estado: 'Modernizado en 2026',
    periodo: '2024 · sin actividad significativa en 2025 · retomado en junio de 2026',
    resumen:
      'Proyecto de streaming musical iniciado en 2024 y retomado en 2026 para modernizar el frontend y ampliar la experiencia de reproducción.',
    problema:
      'Construir una experiencia de streaming musical sobre un backend académico existente y actualizar el cliente a una arquitectura Angular moderna.',
    contribucion:
      'Participé como jefe de proyecto y desarrollador en la etapa académica de 2024; en 2026 retomé personalmente el desarrollo como responsable de la modernización.',
    decisiones: [
      'Backend Java 17 y Spring Boot con PostgreSQL para catálogo, perfiles y reproducción.',
      'Streaming HTTP con soporte de solicitudes Range y respuestas 200/206.',
      'Frontend Angular 21 con componentes standalone, Signals y ejecución zoneless.',
      'Reproductor basado en HTMLAudioElement y Web Audio, con Three.js para la experiencia inmersiva.',
    ],
    implementacion: [
      'Reproductor funcional con cola, seek, volumen, siguiente/anterior y modos shuffle/repeat.',
      'Catálogo, playlists, favoritos, follows y perfiles conectados a datos reales.',
      'Autenticación Keycloak/OAuth2/OIDC implementada en la etapa original de 2024.',
      'Cliente moderno con guards, interceptor y manejo de sesión preparado para reactivar la integración.',
    ],
    resultado: [
      'Modernización funcional del frontend con una arquitectura reactiva y zoneless.',
      'Mejora del reproductor y de la interacción con el catálogo musical.',
    ],
    limites: [
      'El proyecto no tuvo actividad significativa en 2025; no fue un desarrollo continuo entre 2024 y 2026.',
      'La autenticación funcionó en la etapa académica original, pero su reactivación integral en el estado moderno sigue pendiente.',
      'La ejecución integrada actual de frontend, backend, PostgreSQL y Keycloak no fue verificada.',
    ],
    stack: ['Java 17', 'Spring Boot', 'PostgreSQL', 'Angular 21', 'Signals', 'Zoneless', 'Web Audio', 'Three.js'],
    evidencia: [
      { label: 'Backend en GitHub', url: 'https://github.com/TheJose24/EuphonyApp-Backend', external: true },
      { label: 'Frontend en GitHub', url: 'https://github.com/TheJose24/euphony-front', external: true },
    ],
  },
  {
    key: 'healthyme',
    archivo: 'healthyme.ms',
    titulo: 'HealthyMe',
    tipo: 'Proyecto académico',
    estado: 'Implementación parcial',
    periodo: 'Abril — julio de 2025',
    resumen:
      'Evolución académica parcialmente implementada con Java, Spring Boot y Angular bajo una arquitectura orientada a microservicios.',
    problema:
      'Explorar la separación de dominios clínicos y la integración de servicios dentro de una arquitectura distribuida.',
    contribucion:
      'Trabajé como desarrollador Full Stack académico en el diseño modular, los servicios backend, la interfaz Angular y las integraciones del proyecto.',
    decisiones: [
      'Estructura Maven de 15 módulos: 14 aplicaciones Spring Boot y una biblioteca commons.',
      'Config Server, Eureka y API Gateway como base de configuración, descubrimiento y entrada.',
      'OAuth2/OIDC y JWT implementados en código mediante un servicio de autorización.',
      'Docker Compose para describir la infraestructura y los servicios del entorno local.',
    ],
    implementacion: [
      'Java 21, Spring Boot 3.4 y Spring Data JPA con persistencia MySQL.',
      'Frontend Angular 17 con áreas públicas, administrativas, médicas y de pacientes.',
      'Integraciones con Stripe y Ollama dentro del alcance del proyecto.',
      'Kafka y Resilience4j presentes como implementaciones parciales.',
    ],
    resultado: [
      'Práctica técnica de arquitectura distribuida, separación de dominios e integración de servicios.',
      'Base modular amplia que documenta tanto las capacidades implementadas como sus límites.',
    ],
    limites: [
      'Proyecto académico incompleto; no se presenta como producto terminado ni disponible en producción.',
      'La ejecución conjunta de los 14 servicios mediante Docker Compose no fue verificada.',
      'Kafka y Resilience4j permanecen parciales; Saga, persistencia MongoDB y Jenkins CI/CD no forman parte de las capacidades implementadas.',
    ],
    stack: ['Java 21', 'Spring Boot 3.4', 'Spring Cloud', 'Angular 17', 'MySQL/JPA', 'OAuth2/OIDC/JWT', 'Docker Compose'],
    evidencia: [
      { label: 'Backend en GitHub', url: 'https://github.com/TheJose24/HealthyMe-Backend', external: true },
      { label: 'Frontend en GitHub', url: 'https://github.com/TheJose24/HealthyMe-Frontend', external: true },
    ],
  },
  {
    key: 'homelab',
    archivo: 'homelab.infra',
    titulo: 'Homelab',
    tipo: 'Infraestructura personal',
    estado: 'Operación bajo demanda',
    periodo: '2024 — actualidad',
    resumen:
      'Entorno personal para practicar despliegue, aislamiento, redes privadas y operación de software bajo demanda.',
    problema:
      'Crear un entorno propio para experimentar con despliegue, aislamiento, redes y operación, con control sobre el ciclo de vida de cada carga.',
    contribucion:
      'Diseñé, configuré y mantengo el entorno como laboratorio personal de infraestructura y entrega de software.',
    decisiones: [
      'Proxmox VE como base de virtualización del entorno.',
      'VM y contenedores LXC según las necesidades de aislamiento y ciclo de vida.',
      'Docker para empaquetar y operar aplicaciones y herramientas personales.',
      'Tailscale para acceso privado y Cloudflare Tunnel para publicación web selectiva, con operación bajo demanda.',
    ],
    implementacion: [
      'Entornos virtualizados y contenerizados para pruebas y servicios personales.',
      'Acceso remoto privado y publicación selectiva sin exposición directa de puertos WAN.',
    ],
    resultado: [
      'Entorno operativo personal para experimentar con infraestructura y entrega de software.',
      'Separación de cargas por aislamiento y ciclo de vida dentro de recursos deliberadamente limitados.',
    ],
    limites: [
      'Es un laboratorio personal, no un servicio con disponibilidad comprometida.',
      'Opera bajo demanda y no publica inventario, capacidades, identificadores ni detalles sensibles de red.',
    ],
    stack: ['Proxmox VE', 'VM/LXC', 'Docker', 'Tailscale', 'Cloudflare Tunnel'],
    evidencia: [
      { label: 'Ver homelab', url: '/homelab' },
    ],
  },
];

export function buscarProyecto(termino: string): Proyecto | undefined {
  const t = termino.toLowerCase().replace(/\.(org|ms|svc|infra)$/, '');
  return PROYECTOS.find((p) => p.key === t) ?? PROYECTOS.find((p) => p.key.startsWith(t));
}
