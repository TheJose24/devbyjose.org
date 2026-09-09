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

    expect(el.querySelectorAll('h1').length).toBe(1);
    expect(el.querySelector('h1')?.textContent).toContain('Proyectos');
    expect(el.querySelector('.titulo')?.textContent).toContain(PROYECTOS[0].titulo);

    const repos = el.querySelectorAll<HTMLAnchorElement>('a.repo');
    expect(repos.length).toBe(2);
    expect(repos[0].textContent).toContain('Backend');
    expect(repos[1].textContent).toContain('Frontend');
    expect(repos[0].href).toBe('https://github.com/TheJose24/HealthyMe-Backend');
    expect(repos[0].rel).toContain('noopener');
    expect(repos[0].getAttribute('aria-label')).toContain('se abre en una pestaña nueva');
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
    fixture.detectChanges();

    let paneles = fixture.nativeElement.querySelectorAll('dbj-pane') as NodeListOf<HTMLElement>;
    expect(paneles[0].hidden).toBe(false);
    expect(paneles[1].hidden).toBe(true);
    expect(paneles[0].getAttribute('role')).toBe('tabpanel');

    ((fixture.nativeElement as HTMLElement).querySelectorAll('button.fila')[1] as HTMLElement).click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(wm.focused()).toBe('cat README');
    paneles = fixture.nativeElement.querySelectorAll('dbj-pane') as NodeListOf<HTMLElement>;
    expect(paneles[0].hidden).toBe(true);
    expect(paneles[1].hidden).toBe(false);
    expect(paneles[1].getAttribute('aria-labelledby')).toBe('tab-cat-readme');
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
