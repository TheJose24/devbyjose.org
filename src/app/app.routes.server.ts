import { RenderMode, ServerRoute } from '@angular/ssr';
import { NOTAS } from './data/notas';
import { NOTAS_PUBLICADAS } from './core/wm';

export const serverRoutes: ServerRoute[] = [
  ...(NOTAS_PUBLICADAS ? [{
    // Una página estática por nota: el artículo entero viaja dentro del HTML,
    // sin depender de que el navegador ejecute nada.
    path: 'notas/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => NOTAS.map((n) => ({ slug: n.slug })),
  } as ServerRoute] : []),
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
