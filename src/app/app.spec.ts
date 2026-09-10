import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Location } from '@angular/common';
import { App } from './app';
import { Inicio } from './workspaces/inicio/inicio';
import { WORKSPACES, Wm, panelId, routeFor, workspaceFromUrl } from './core/wm';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, Inicio],
      providers: [provideRouter([
        { path: '', children: [] },
        { path: 'proyectos', children: [] },
      ])],
    }).compileComponents();
  });

  it('presenta la home recruiter-first sin introducir regresiones en la terminal', async () => {
    const app = TestBed.createComponent(App);
    const inicio = TestBed.createComponent(Inicio);
    await Promise.all([app.whenStable(), inicio.whenStable()]);

    expect(app.componentInstance).toBeTruthy();

    const el = inicio.nativeElement as HTMLElement;
    const headings = el.querySelectorAll('h1');
    expect(headings.length).toBe(1);
    expect(headings[0].textContent).toContain('José Sánchez');
    expect(el.querySelector('pre')?.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('.hero-role')?.textContent).toContain(
      'Desarrollador de Software · Java & Full Stack',
    );
    expect(el.querySelector('.hero-tagline')?.textContent?.trim()).toBe(
      'Desarrollo y modernizo sistemas empresariales con Java, Spring Boot, Angular y Oracle, conectando software, rendimiento e infraestructura.',
    );

    const acciones = [...el.querySelectorAll<HTMLAnchorElement>('.acciones a')];
    expect(acciones.map((a) => a.textContent?.trim())).toEqual([
      'Ver proyectos', 'Descargar CV', 'LinkedIn', 'GitHub', 'Contactar',
    ]);
    expect(acciones[1].getAttribute('href')).toBe('/cv.pdf');
    expect(acciones[2].href).toBe('https://www.linkedin.com/in/devbyjose');
    expect(acciones[3].href).toBe('https://github.com/TheJose24');

    const sections = [...el.querySelectorAll<HTMLElement>('[data-home-section]')];
    expect(sections.map((section) => section.dataset['homeSection'])).toEqual([
      'hero', 'evidence', 'experience', 'projects', 'skills', 'homelab', 'education', 'contact',
    ]);
    expect(el.querySelector('.experience-entry')?.textContent).toContain('Qallpa TIC');
    expect(el.querySelector('.experience-entry')?.textContent).toContain('Desarrollador Java Junior');
    expect(el.querySelectorAll('.experience-entry li').length).toBe(5);
    expect([...el.querySelectorAll('.project-card h3')].map((h) => h.textContent?.trim())).toEqual([
      'devbyjose.org', 'Euphony', 'HealthyMe', 'Homelab',
    ]);
    const projectLinks = [...el.querySelectorAll<HTMLAnchorElement>('.project-link')];
    expect(projectLinks.length).toBe(4);
    expect(projectLinks[0].href).toBe('https://github.com/TheJose24/devbyjose.org');
    expect(projectLinks[3].getAttribute('href')).toBe('/homelab');
    expect([...el.querySelectorAll('.skill-group dt')].map((dt) => dt.textContent?.trim())).toEqual([
      'Backend', 'Frontend', 'Datos', 'Entrega e infraestructura', 'Automatización e IA',
    ]);
    expect(el.querySelector('.homelab-teaser')?.textContent).toContain(
      'Infraestructura personal para experimentar con despliegue, aislamiento, redes privadas y operación bajo demanda.',
    );
    expect(el.querySelector('.education')?.textContent).toContain('Egreso previsto: diciembre 2026');
    expect([...el.querySelectorAll('.contact-actions a')].map((a) => a.textContent?.trim())).toEqual([
      'Email', 'LinkedIn', 'GitHub', 'Descargar CV',
    ]);
    expect(el.querySelector('.evidence-item:nth-child(2)')?.textContent).not.toContain('70 %');
    expect(el.querySelector('.experience-entry')?.textContent).toContain('70 %');

    const panes = [...el.querySelectorAll<HTMLElement>('dbj-pane')];
    expect(panes.length).toBe(3);
    expect(panes[1].querySelector('.technical-identity')).toBeTruthy();
    expect(panes[1].querySelector('.terminal-section dbj-zsh')).toBeTruthy();
    expect(panes[2].textContent).toContain('history');

    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    el.querySelector('input')?.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);

    const tabGlobal = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    window.dispatchEvent(tabGlobal);
    expect(tabGlobal.defaultPrevented).toBe(false);

    for (const key of ['Enter', ' ', 'Escape']) {
      const standardKey = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      window.dispatchEvent(standardKey);
      expect(standardKey.defaultPrevented).toBe(false);
    }

    const shiftTab = new KeyboardEvent('keydown', {
      key: 'Tab', shiftKey: true, bubbles: true, cancelable: true,
    });
    el.querySelector('input')?.dispatchEvent(shiftTab);
    expect(shiftTab.defaultPrevented).toBe(false);

    const appEl = app.nativeElement as HTMLElement;
    expect(appEl.querySelector('.skip-link')?.getAttribute('href')).toBe('#contenido-principal');
    expect((app.nativeElement as HTMLElement).querySelector('main#contenido-principal')).toBeTruthy();
    expect(appEl.querySelector('.bar-mod')).toBeNull();
    expect(appEl.textContent).not.toContain('homelab bajo demanda');
  });

  it('resalta en la barra el espacio de la ruta actual', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const wm = TestBed.inject(Wm);
    const el = fixture.nativeElement as HTMLElement;

    expect(wm.workspace()).toBe('inicio');
    expect(el.querySelector('.ws-btn.active')?.textContent).toContain('inicio');

    await TestBed.inject(Location).go('/proyectos');
    (el.querySelectorAll('.ws-btn')[1] as HTMLElement).click();
    await fixture.whenStable();

    expect(wm.workspace()).toBe('proyectos');
    expect(el.querySelector('.ws-btn.active')?.textContent).toContain('proyectos');
  });

  it('pinta un enlace por espacio y pestañas compactas relacionadas con sus paneles', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const enlaces = el.querySelectorAll<HTMLAnchorElement>('a.ws-btn');
    // Contra WORKSPACES y no contra un número fijo: así la prueba sigue
    // valiendo cuando un espacio se oculta o se vuelve a publicar.
    expect(enlaces.length).toBe(WORKSPACES.length);
    expect(enlaces[0].textContent).toContain('inicio');
    expect(enlaces[0].getAttribute('aria-current')).toBe('page');

    const wm = TestBed.inject(Wm);
    wm.register('uno');
    wm.register('dos');
    wm.compact.set(true);
    fixture.detectChanges();

    const tabs = el.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    expect(tabs.length).toBe(2);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('aria-controls')).toBe(panelId('uno'));

    tabs[0].dispatchEvent(new KeyboardEvent('keydown', {
      key: 'ArrowRight', bubbles: true, cancelable: true,
    }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(wm.focused()).toBe('dos');
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
  });

  it('oculta la pestaña compacta única de proyectos sin afectar otros espacios', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const wm = TestBed.inject(Wm);
    const el = fixture.nativeElement as HTMLElement;

    wm.compact.set(true);
    wm.goto('proyectos');
    wm.register('proyectos');
    fixture.detectChanges();
    expect(el.querySelector('.tabs')).toBeNull();

    wm.goto('homelab');
    fixture.detectChanges();
    expect(el.querySelectorAll('[role="tab"]').length).toBe(1);

    wm.goto('proyectos');
    wm.register('detalle');
    fixture.detectChanges();
    expect(el.querySelectorAll('[role="tab"]').length).toBe(2);
  });
});

describe('Wm', () => {
  let wm: Wm;
  beforeEach(() => { TestBed.configureTestingModule({}); wm = TestBed.inject(Wm); });

  it('la primera ventana registrada se lleva el foco', () => {
    wm.register('neofetch');
    wm.register('history');
    expect(wm.focused()).toBe('neofetch');
  });

  it('cambiar de espacio no toca la lista de ventanas', () => {
    // Las ventanas se dan de baja solas al destruirse; vaciarlas aquí competía
    // con el registro de las nuevas al montarse la ruta siguiente.
    wm.register('neofetch');
    wm.goto('notas');
    expect(wm.workspace()).toBe('notas');
    expect(wm.tabs()).toEqual(['neofetch']);
  });

  it('step da la vuelta salvo cuando se le pide que no', () => {
    wm.register('a'); wm.register('b');
    wm.step(-1);              // desde 'a', hacia atrás
    expect(wm.focused()).toBe('b');
    wm.focus('a');
    wm.step(-1, false);       // en el extremo, sin dar la vuelta
    expect(wm.focused()).toBe('a');
  });

  it('al cerrar la ventana enfocada el foco pasa a la primera que queda', () => {
    wm.register('a'); wm.register('b');
    wm.focus('b');
    wm.unregister('b');
    expect(wm.focused()).toBe('a');
  });
});

describe('correspondencia entre ruta y espacio', () => {
  it('routeFor deja inicio en la raíz', () => {
    expect(routeFor('inicio')).toBe('/');
    expect(routeFor('homelab')).toBe('/homelab');
  });

  it('workspaceFromUrl reconoce el primer segmento', () => {
    expect(workspaceFromUrl('/')).toBe('inicio');
    expect(workspaceFromUrl('/proyectos')).toBe('proyectos');
    expect(workspaceFromUrl('/homelab?x=1#y')).toBe('homelab');
  });

  it('una ruta de un espacio oculto cae en inicio', () => {
    // Con las notas ocultas, /notas ya no existe y el comodín redirige.
    if (WORKSPACES.some((w) => w.id === 'notas')) {
      expect(workspaceFromUrl('/notas/nota-de-ejemplo')).toBe('notas');
    } else {
      expect(workspaceFromUrl('/notas/nota-de-ejemplo')).toBe('inicio');
    }
  });

  it('lo desconocido cae en inicio', () => {
    expect(workspaceFromUrl('/musica')).toBe('inicio');
    expect(workspaceFromUrl('')).toBe('inicio');
  });

  it('ida y vuelta para todos los espacios', () => {
    for (const { id } of WORKSPACES) {
      expect(workspaceFromUrl(routeFor(id))).toBe(id);
    }
  });
});
