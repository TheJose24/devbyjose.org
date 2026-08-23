import { TestBed } from '@angular/core/testing';
import { Proyectos } from './proyectos';
import { Wm } from '../../core/wm';
import { PROYECTOS, buscarProyecto } from '../../data/proyectos';

describe('Proyectos', () => {
  async function montar() {
    await TestBed.configureTestingModule({ imports: [Proyectos] }).compileComponents();
    const fixture = TestBed.createComponent(Proyectos);
    await fixture.whenStable();
    return fixture;
  }

  it('lista todos los proyectos y abre el primero', async () => {
    const el = (await montar()).nativeElement as HTMLElement;
    expect(el.querySelectorAll('button.fila').length).toBe(PROYECTOS.length);

    expect(el.querySelector('.titulo')?.textContent).toContain(PROYECTOS[0].titulo);
  });

  it('al elegir otra fila cambia la ficha', async () => {
    const fixture = await montar();
    const el = fixture.nativeElement as HTMLElement;
    (el.querySelectorAll('button.fila')[1] as HTMLElement).click();
    await fixture.whenStable();
    expect(el.querySelector('.titulo')?.textContent).toContain(PROYECTOS[1].titulo);
  });

  it('en compacto el toque trae la ficha al frente', async () => {
    const fixture = await montar();
    const wm = TestBed.inject(Wm);
    wm.compact.set(true);
    wm.register('ls -la ~/proyectos');
    wm.register('cat README');
    wm.focus('ls -la ~/proyectos');

    ((fixture.nativeElement as HTMLElement).querySelectorAll('button.fila')[1] as HTMLElement).click();
    await fixture.whenStable();
    expect(wm.focused()).toBe('cat README');
  });

  it('cada proyecto explica una decisión, no solo su stack', () => {
    for (const p of PROYECTOS) expect(p.porQue.length).toBeGreaterThan(80);
  });
});

describe('buscarProyecto', () => {
  it('encuentra por clave, por prefijo y con extensión', () => {
    expect(buscarProyecto('healthyme')?.key).toBe('healthyme');
    expect(buscarProyecto('health')?.key).toBe('healthyme');
    expect(buscarProyecto('euphony.svc')?.key).toBe('euphony');
  });
  it('devuelve undefined si no hay nada parecido', () => {
    expect(buscarProyecto('nada')).toBeUndefined();
  });
});
