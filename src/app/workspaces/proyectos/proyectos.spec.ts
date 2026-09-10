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

  it('ordena los cuatro proyectos y abre devbyjose.org como flagship', async () => {
    const el = (await montar()).nativeElement as HTMLElement;
    const opciones = [...el.querySelectorAll<HTMLButtonElement>('.project-option')];

    expect(opciones.map((option) => option.querySelector('strong')?.textContent?.trim())).toEqual([
      'devbyjose.org', 'Euphony', 'HealthyMe', 'Homelab',
    ]);
    expect(opciones[0].getAttribute('aria-pressed')).toBe('true');
    expect(el.querySelector('.case-heading h2')?.textContent).toContain('devbyjose.org');
    expect(el.querySelectorAll('h1').length).toBe(1);
  });

  it('presenta estados y la estructura completa del caso de estudio', async () => {
    const el = (await montar()).nativeElement as HTMLElement;
    expect([...el.querySelectorAll('.project-status')].map((badge) => badge.textContent?.trim())).toEqual([
      'Activo', 'Modernizado en 2026', 'Implementación parcial', 'Operación bajo demanda',
    ]);
    expect([...el.querySelectorAll('.case-section h3')].map((heading) => heading.textContent?.trim())).toEqual([
      'Contexto', 'Problema', 'Mi contribución', 'Decisiones técnicas', 'Implementación',
      'Resultado', 'Estado y límites', 'Stack', 'Evidencia',
    ]);
  });

  it('cambia el caso seleccionado y mantiene enlaces externos seguros', async () => {
    const fixture = await montar();
    const el = fixture.nativeElement as HTMLElement;
    el.querySelectorAll<HTMLButtonElement>('.project-option')[1].click();
    await fixture.whenStable();

    expect(el.querySelector('.case-heading h2')?.textContent).toContain('Euphony');
    const links = [...el.querySelectorAll<HTMLAnchorElement>('.project-links a')];
    expect(links.map((link) => link.href)).toEqual([
      'https://github.com/TheJose24/EuphonyApp-Backend',
      'https://github.com/TheJose24/euphony-front',
    ]);
    for (const link of links) {
      expect(link.target).toBe('_blank');
      expect(link.rel).toContain('noopener');
      expect(link.getAttribute('aria-label')).toContain('se abre en una pestaña nueva');
    }
  });

  it('explicita la separación temporal y el límite de autenticación de Euphony', () => {
    const euphony = PROYECTOS.find((project) => project.key === 'euphony')!;
    expect(euphony.periodo).toContain('sin actividad significativa en 2025');
    expect(euphony.limites.join(' ')).toContain('no fue un desarrollo continuo');
    expect(euphony.limites.join(' ')).toContain('reactivación integral');
  });

  it('mantiene HealthyMe parcial y sin claims prohibidos', () => {
    const healthy = PROYECTOS.find((project) => project.key === 'healthyme')!;
    const contenido = JSON.stringify(healthy);

    expect(healthy.estado).toBe('Implementación parcial');
    expect(healthy.periodo).toBe('Abril — julio de 2025');
    expect(contenido).toContain('15 módulos');
    expect(contenido).toContain('14 aplicaciones Spring Boot');
    expect(contenido).toContain('Kafka y Resilience4j permanecen parciales');
    expect(contenido).toContain('ejecución conjunta');
    expect(contenido).not.toMatch(/Saga implementada|MongoDB implementad|Jenkins CI\/CD versionado|disponibilidad productiva|proyecto terminado/i);
  });

  it('en mobile conserva selector y detalle en un solo panel y scroll natural', async () => {
    const fixture = await montar();
    const wm = TestBed.inject(Wm);
    wm.compact.set(true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const pane = el.querySelector('dbj-pane') as HTMLElement;
    expect(el.querySelectorAll('dbj-pane').length).toBe(1);
    expect(pane.hidden).toBe(false);
    expect(el.querySelector('.project-browser')?.nextElementSibling).toBe(el.querySelector('.case-study'));
  });

  it('centraliza contenido completo y evidencia para todos los proyectos', () => {
    expect(JSON.stringify(PROYECTOS)).not.toContain('%');
    expect(JSON.stringify(PROYECTOS.find((project) => project.key === 'homelab'))).not.toContain('empleo');
    for (const project of PROYECTOS) {
      expect(project.problema.length).toBeGreaterThan(40);
      expect(project.contribucion.length).toBeGreaterThan(40);
      expect(project.decisiones.length).toBeGreaterThanOrEqual(2);
      expect(project.implementacion.length).toBeGreaterThanOrEqual(2);
      expect(project.resultado.length).toBeGreaterThanOrEqual(1);
      expect(project.limites.length).toBeGreaterThanOrEqual(1);
      expect(project.stack.length).toBeGreaterThanOrEqual(3);
      expect(project.evidencia.length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('buscarProyecto', () => {
  it('encuentra por clave, prefijo y extensión', () => {
    expect(buscarProyecto('devbyjose.org')?.key).toBe('devbyjose');
    expect(buscarProyecto('health')?.key).toBe('healthyme');
    expect(buscarProyecto('euphony.svc')?.key).toBe('euphony');
  });

  it('devuelve undefined si no hay nada parecido', () => {
    expect(buscarProyecto('nada')).toBeUndefined();
  });
});
