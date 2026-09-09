import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Location } from '@angular/common';
import { App } from './app';
import { WORKSPACES, Wm, routeFor, workspaceFromUrl } from './core/wm';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([
        { path: '', children: [] },
        { path: 'proyectos', children: [] },
      ])],
    }).compileComponents();
  });

  it('se crea', () => {
    expect(TestBed.createComponent(App).componentInstance).toBeTruthy();
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

  it('pinta un botón por espacio de trabajo', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const botones = (fixture.nativeElement as HTMLElement).querySelectorAll('.ws-btn');
    // Contra WORKSPACES y no contra un número fijo: así la prueba sigue
    // valiendo cuando un espacio se oculta o se vuelve a publicar.
    expect(botones.length).toBe(WORKSPACES.length);
    expect(botones[0].textContent).toContain('inicio');
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
