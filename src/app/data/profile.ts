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

export const SPECS: readonly Spec[] = [
  { key: 'rol', value: 'Software Engineer · Java & Full Stack' },
  { key: 'kernel', value: 'Java 21 · Spring Boot · Quarkus' },
  { key: 'shell', value: 'Angular 22', note: 'zoneless · signals' },
  { key: 'wm', value: 'Linux · Proxmox VE · Docker' },
  { key: 'db', value: 'Oracle · PostgreSQL · MySQL' },
  { key: 'infra', value: 'vLLM · NVIDIA multi-GPU', note: 'inferencia interna de LLMs' },
  { key: 'empresa', value: 'Qallpa TIC', note: 'Desarrollador Java Junior · desde 2025-03' },
  { key: 'locale', value: 'Lima, Perú', note: 'UTC-5' },
  { key: 'email', value: 'devbyjose@gmail.com', accent: true },
  { key: 'github', value: 'TheJose24', accent: true },
  { key: 'linkedin', value: 'in/devbyjose', accent: true },
];

export const PALETTE: readonly string[] = [
  '#1b2022', '#2a3336', '#465049', '#697570',
  '#c9d1cd', '#4ade80', '#e8b04a', '#58a6ff',
];

export const BIO: readonly string[] = [
  'Desarrollador de software enfocado en Java y desarrollo Full Stack.',
  'Trabajo con Spring Boot, Quarkus, Angular y Oracle/PLSQL en sistemas empresariales: mantenimiento de legacy, nuevas soluciones, despliegues y optimización de rendimiento.',
];

export const BIO_TAIL =
  'Complemento el desarrollo con Docker, Linux, automatización con n8n e infraestructura interna de inferencia de LLMs con vLLM sobre NVIDIA multi-GPU.';

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
