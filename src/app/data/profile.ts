export const ASCII_NAME = [
  '     ██╗ ██████╗ ███████╗███████╗',
  '     ██║██╔═══██╗██╔════╝██╔════╝',
  '     ██║██║   ██║███████╗█████╗  ',
  '██   ██║██║   ██║╚════██║██╔══╝  ',
  '╚█████╔╝╚██████╔╝███████║███████╗',
  ' ╚════╝  ╚═════╝ ╚══════╝╚══════╝',
].join('\n');

export interface Spec {
  readonly key: string;
  readonly value: string;
  /** Se pinta con el color de acento (contacto, enlaces). */
  readonly accent?: boolean;
  readonly note?: string;
}

export const TECHNICAL_SPECS: readonly Spec[] = [
  { key: 'backend', value: 'Java · Spring Boot · Quarkus' },
  { key: 'frontend', value: 'Angular · TypeScript' },
  { key: 'datos', value: 'Oracle SQL/PLSQL' },
  { key: 'entrega', value: 'Linux · Docker' },
];

export const PALETTE: readonly string[] = [
  '#1b2022', '#2a3336', '#465049', '#697570',
  '#c9d1cd', '#4ade80', '#e8b04a', '#58a6ff',
];

/** Acciones públicas y canónicas; la terminal ofrece los mismos destinos. */
export const PROFESSIONAL_LINKS = {
  proyectos: '/proyectos',
  homelab: '/homelab',
  cv: '/cv.pdf',
  github: 'https://github.com/TheJose24',
  linkedin: 'https://www.linkedin.com/in/devbyjose',
  email: 'mailto:devbyjose@gmail.com',
} as const;

export const HOME_HERO = {
  name: 'José Sánchez',
  title: 'Desarrollador de Software · Java & Full Stack',
  tagline:
    'Desarrollo y modernizo sistemas empresariales con Java, Spring Boot, Angular y Oracle, conectando software, rendimiento e infraestructura.',
  location: 'Lima, Perú · UTC-5',
} as const;

export interface EvidenceBlock {
  readonly title: string;
  readonly text: string;
}

export const HOME_EVIDENCE: readonly EvidenceBlock[] = [
  {
    title: 'Sistemas empresariales',
    text: 'Java · Spring Boot · Quarkus · Angular · Oracle SQL/PLSQL',
  },
  {
    title: 'Modernización y rendimiento',
    text: 'Modernización de aplicaciones legacy, nuevas soluciones y optimización de rendimiento en Oracle.',
  },
  {
    title: 'Entrega y operación',
    text: 'Despliegues, Linux, Docker, automatización e infraestructura complementaria.',
  },
];

export const HOME_EXPERIENCE = {
  employer: 'Qallpa TIC',
  role: 'Desarrollador Java Junior',
  period: 'Marzo 2025 — actualidad',
  bullets: [
    'Desarrollo y mantenimiento de sistemas empresariales con funciones Full Stack en Java, Spring Boot, Quarkus, Angular y Oracle SQL/PLSQL.',
    'Modernización de aplicaciones legacy y construcción de nuevas soluciones.',
    'Optimización de consultas Oracle con una reducción aproximada del 70 % en tiempos de respuesta.',
    'Despliegues, configuración de ambientes y automatización de procesos con n8n.',
    'Implementación y administración de infraestructura interna de inferencia de LLMs con vLLM sobre NVIDIA multi-GPU.',
  ],
} as const;

export interface SkillGroup {
  readonly title: string;
  readonly items: string;
}

export const HOME_SKILLS: readonly SkillGroup[] = [
  { title: 'Backend', items: 'Java · Spring Boot · Quarkus · Spring Data JPA / Hibernate · APIs REST' },
  { title: 'Frontend', items: 'Angular · TypeScript · RxJS · Signals' },
  { title: 'Datos', items: 'Oracle SQL/PLSQL · PostgreSQL · MySQL' },
  {
    title: 'Entrega e infraestructura',
    items: 'Git · Docker · Linux · Jenkins · Proxmox VE · Tailscale · Cloudflare Tunnel',
  },
  { title: 'Automatización e IA', items: 'n8n · vLLM · OpenAI API · WhatsApp Business API' },
];

export interface FeaturedProject {
  readonly name: string;
  readonly type: string;
  readonly status: string;
  readonly value: string;
  readonly stack: string;
  readonly route?: '/proyectos' | '/homelab';
  readonly href?: string;
}

export const HOME_PROJECTS: readonly FeaturedProject[] = [
  {
    name: 'devbyjose.org',
    type: 'Proyecto personal',
    status: 'Activo',
    value: 'Portafolio Angular con contenido técnico, renderizado estático y pruebas automatizadas.',
    stack: 'Angular 22 · TypeScript · Cloudflare Workers',
    href: 'https://github.com/TheJose24/devbyjose.org',
  },
  {
    name: 'Euphony',
    type: 'Proyecto académico · modernización personal',
    status: 'Retomado en 2026',
    value: 'Streaming musical con backend Spring Boot/PostgreSQL y frontend modernizado con Angular 21.',
    stack: 'Java · Spring Boot · PostgreSQL · Angular 21',
    href: 'https://github.com/TheJose24/euphony-front',
  },
  {
    name: 'HealthyMe',
    type: 'Proyecto académico',
    status: 'Implementación parcial',
    value: 'Exploración de una arquitectura de microservicios para el dominio clínico.',
    stack: 'Java 21 · Spring Boot · Angular 17 · MySQL',
    href: 'https://github.com/TheJose24/HealthyMe-Backend',
  },
  {
    name: 'Homelab',
    type: 'Proyecto personal',
    status: 'Operación bajo demanda',
    value: 'Entorno personal para practicar virtualización, contenedores y operación.',
    stack: 'Proxmox VE · VM/LXC · Docker',
    route: '/homelab',
  },
];

export const HOME_HOMELAB = {
  text: 'Infraestructura personal para experimentar con despliegue, aislamiento, redes privadas y operación bajo demanda.',
  stack: 'Proxmox VE · VM/LXC · Docker · Tailscale · Cloudflare Tunnel',
} as const;

export const HOME_EDUCATION = {
  program: 'Ingeniería de Sistemas e Informática',
  institution: 'Universidad Tecnológica del Perú',
  cycle: '10.º y último ciclo',
  graduation: 'Egreso previsto: diciembre 2026',
} as const;

export const HOME_CONTACT =
  'Conversemos sobre oportunidades en desarrollo Java, modernización y soluciones Full Stack.';

export interface HistoryEntry {
  readonly when: string;
  readonly command: string;
  readonly note?: string;
}

/** Trayectoria como historial de shell. Las fechas con mes salen del primer
 *  commit de cada repositorio o del perfil de LinkedIn; las que van solo con
 *  año es porque el trabajo se repartió a lo largo de él. */
export const HISTORY: readonly HistoryEntry[] = [
  { when: '2022-03', command: './matricular --uni utp --carrera "ing. sistemas"' },
  { when: '2022-03', command: 'git clone oracle-next-education' },
  { when: '2024-08', command: './liderar euphony --marco pmbok' },
  { when: '2025-03', command: './join qallpa-tic --cargo desarrollador-java-junior' },
  { when: '2025-04', command: './desarrollar healthyme --alcance academico-parcial' },
  { when: '2025', command: './optimizar --oracle --resultado "reduccion aproximada del 70% en tiempos de respuesta"' },
  { when: '2026', command: './administrar vllm --infraestructura "nvidia multi-gpu"' },
  { when: '2026', command: './automatizar --n8n' },
  { when: '2026-06', command: './migrar euphony --angular 21 --zoneless' },
  { when: '2026-08', command: './desarrollar sistemas-empresariales --java 21 --quarkus', note: 'en curso' },
  { when: '2026-12', command: './graduar', note: 'pendiente' },
];
