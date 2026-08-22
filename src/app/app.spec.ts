import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { Wm } from './core/wm';
import { ago } from './core/homelab';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('se crea', () => {
    expect(TestBed.createComponent(App).componentInstance).toBeTruthy();
  });

  it('pinta un botón por espacio de trabajo', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const botones = (fixture.nativeElement as HTMLElement).querySelectorAll('.ws-btn');
    expect(botones.length).toBe(4);
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

  it('cambiar de espacio vacía las ventanas', () => {
    wm.register('neofetch');
    wm.goto('notas');
    expect(wm.tabs()).toEqual([]);
    expect(wm.focused()).toBeNull();
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

describe('ago', () => {
  const base = Date.parse('2026-08-22T12:00:00Z');
  it('minutos, horas y días', () => {
    expect(ago('2026-08-22T11:30:00Z', base)).toBe('hace 30 min');
    expect(ago('2026-08-22T09:00:00Z', base)).toBe('hace 3 h');
    expect(ago('2026-08-20T12:00:00Z', base)).toBe('hace 2 d');
  });
  it('devuelve null si la fecha no es válida', () => {
    expect(ago('no-es-una-fecha', base)).toBeNull();
  });
});
