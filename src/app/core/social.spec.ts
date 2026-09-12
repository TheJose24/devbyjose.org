import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { Social, TARJETAS, claveDeRuta } from './social';
import { WORKSPACES, routeFor } from './wm';

describe('claveDeRuta', () => {
  it('normaliza la barra final y la raíz', () => {
    expect(claveDeRuta('/')).toBe('/');
    expect(claveDeRuta('/homelab/')).toBe('/homelab');
    expect(claveDeRuta('/homelab')).toBe('/homelab');
  });

  it('descarta consulta y ancla', () => {
    expect(claveDeRuta('/notas?x=1#a')).toBe('/notas');
  });

  it('una nota concreta hereda la tarjeta de notas', () => {
    expect(claveDeRuta('/notas/vm-vs-lxc')).toBe('/notas');
  });
});

describe('TARJETAS', () => {
  it('cubre todas las rutas del navegador', () => {
    // Se deriva de WORKSPACES: un espacio nuevo sin tarjeta hace fallar esto
    // en vez de publicarse con la tarjeta genérica del inicio.
    for (const { id } of WORKSPACES) {
      expect(TARJETAS[routeFor(id)]).toBeDefined();
    }
  });

  it('no describe rutas que el sitio no sirve', () => {
    const espacios = new Set(WORKSPACES.map((w) => routeFor(w.id)));
    for (const ruta of Object.keys(TARJETAS)) {
      expect(espacios.has(ruta)).toBe(true);
    }
  });

  it('ningún título ni descripción se repite entre rutas', () => {
    // Dos rutas con la misma tarjeta dejan al lector sin saber a qué entra.
    const titulos = Object.values(TARJETAS).map((t) => t.titulo);
    const descripciones = Object.values(TARJETAS).map((t) => t.descripcion);
    expect(new Set(titulos).size).toBe(titulos.length);
    expect(new Set(descripciones).size).toBe(descripciones.length);
  });

  it('las descripciones caben en lo que muestran las redes', () => {
    for (const t of Object.values(TARJETAS)) {
      expect(t.descripcion.length).toBeLessThanOrEqual(200);
      expect(t.descripcion.length).toBeGreaterThan(40);
    }
  });
});

describe('Social', () => {
  function montar() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    return {
      social: TestBed.inject(Social),
      meta: TestBed.inject(Meta),
      title: TestBed.inject(Title),
    };
  }

  it('escribe la tarjeta del homelab, no la del inicio', () => {
    const { social, meta } = montar();
    social.aplicar('/homelab');
    expect(meta.getTag('property="og:title"')?.content).toBe(TARJETAS['/homelab'].titulo);
    expect(meta.getTag('property="og:url"')?.content).toBe('https://www.devbyjose.org/homelab');
  });

  it('usa la imagen general cuando la ruta no define una propia', () => {
    const { social, meta } = montar();
    social.aplicar('/homelab');
    expect(meta.getTag('property="og:image"')?.content).toBe('https://www.devbyjose.org/og.png');
  });

  it('cae a la imagen general cuando la ruta no tiene una propia', () => {
    const { social, meta } = montar();
    social.aplicar('/proyectos');
    expect(meta.getTag('property="og:image"')?.content).toBe('https://www.devbyjose.org/og.png');
  });

  it('una ruta desconocida no deja la tarjeta vacía', () => {
    const { social, meta } = montar();
    social.aplicar('/no-existe');
    expect(meta.getTag('property="og:title"')?.content).toBe(TARJETAS['/'].titulo);
  });

  it('la url absoluta siempre apunta al dominio canónico', () => {
    const { social, meta } = montar();
    social.aplicar('/notas/vm-vs-lxc');
    expect(meta.getTag('property="og:url"')?.content).toBe('https://www.devbyjose.org/notas');
  });

  it('sincroniza title, canonical y metadatos de Twitter por ruta', () => {
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.append(canonical);
    const { social, meta, title } = montar();

    social.aplicar('/proyectos');

    expect(title.getTitle()).toBe(TARJETAS['/proyectos'].titulo);
    expect(canonical.href).toBe('https://www.devbyjose.org/proyectos');
    expect(meta.getTag('name="twitter:title"')?.content).toBe(TARJETAS['/proyectos'].titulo);
    expect(meta.getTag('name="twitter:description"')?.content).toBe(
      TARJETAS['/proyectos'].descripcion,
    );
    expect(meta.getTag('name="twitter:image"')?.content).toBe('https://www.devbyjose.org/og.png');
    canonical.remove();
  });
});
