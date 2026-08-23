import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { Social, TARJETAS, claveDeRuta } from './social';

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
    for (const ruta of ['/', '/proyectos', '/homelab', '/notas']) {
      expect(TARJETAS[ruta]).toBeDefined();
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
    return { social: TestBed.inject(Social), meta: TestBed.inject(Meta) };
  }

  it('escribe la tarjeta del homelab, no la del inicio', () => {
    const { social, meta } = montar();
    social.aplicar('/homelab');
    expect(meta.getTag('property="og:title"')?.content).toBe(TARJETAS['/homelab'].titulo);
    expect(meta.getTag('property="og:url"')?.content).toBe('https://www.devbyjose.org/homelab');
  });

  it('usa la imagen propia de la ruta cuando existe', () => {
    const { social, meta } = montar();
    social.aplicar('/homelab');
    expect(meta.getTag('property="og:image"')?.content).toBe(
      'https://www.devbyjose.org/og-homelab.png',
    );
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
});
