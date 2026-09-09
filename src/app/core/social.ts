import { Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { NOTAS_PUBLICADAS } from './wm';

const SITIO = 'https://www.devbyjose.org';

export interface Tarjeta {
  readonly titulo: string;
  readonly descripcion: string;
  /** Ruta de la imagen dentro del sitio. Sin ella se usa la del inicio. */
  readonly imagen?: string;
}

/**
 * Tarjeta de enlace por ruta. Sin esto, compartir cualquier página del sitio
 * —incluida una nota concreta— muestra la misma tarjeta del inicio, y quien la
 * ve no sabe a qué le está dando clic.
 */
export const TARJETAS: Readonly<Record<string, Tarjeta>> = {
  '/': {
    titulo: 'José Sánchez · Software Engineer · Java & Full Stack',
    descripcion:
      'Desarrollo y modernizo sistemas empresariales con Java, Spring Boot, Angular y Oracle, conectando software, rendimiento e infraestructura.',
  },
  '/proyectos': {
    titulo: 'Proyectos · José Sánchez',
    descripcion:
      'HealthyMe, Euphony y mi homelab: alcance, tecnologías y decisiones técnicas de cada proyecto.',
  },
  '/homelab': {
    titulo: 'Homelab — infraestructura autoalojada',
    descripcion:
      'Proxmox VE, VM/LXC y Docker, con acceso mediante Tailscale y servicios web publicados con Cloudflare Tunnel sin port forwarding desde Internet.',
  },
  ...(NOTAS_PUBLICADAS
    ? {
        '/notas': {
          titulo: 'Notas técnicas · José Sánchez',
          descripcion:
            'Lo que aprendo montando infraestructura y optimizando sistemas que ya están en producción.',
        },
      }
    : {}),
};

const POR_DEFECTO = TARJETAS['/'];

/** Normaliza la URL a la clave del mapa; las notas caen en `/notas`. */
export function claveDeRuta(url: string): string {
  const limpia = url.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  if (limpia.startsWith('/notas/')) return '/notas';
  return limpia;
}

@Injectable({ providedIn: 'root' })
export class Social {
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);

  /** Se llama una vez desde el componente raíz. */
  seguirRutas(): void {
    this.aplicar(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.aplicar(e.urlAfterRedirects));
  }

  aplicar(url: string): void {
    const clave = claveDeRuta(url);
    const t = TARJETAS[clave] ?? POR_DEFECTO;
    const imagen = SITIO + (t.imagen ?? '/og.png');

    this.meta.updateTag({ name: 'description', content: t.descripcion });
    this.meta.updateTag({ property: 'og:title', content: t.titulo });
    this.meta.updateTag({ property: 'og:description', content: t.descripcion });
    this.meta.updateTag({ property: 'og:url', content: SITIO + (clave === '/' ? '/' : clave) });
    this.meta.updateTag({ property: 'og:image', content: imagen });
    this.meta.updateTag({ property: 'og:image:alt', content: t.titulo });
  }
}
