import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Notas } from './notas';
import { Wm } from '../../core/wm';
import { NOTAS, buscarNota, cuerpoDe } from '../../data/notas';

describe('Notas', () => {
  async function montar(slug = '') {
    await TestBed.configureTestingModule({
      imports: [Notas],
      providers: [provideRouter([{ path: 'notas/:slug', children: [] }])],
    }).compileComponents();
    const fixture = TestBed.createComponent(Notas);
    fixture.componentRef.setInput('slug', slug);
    await fixture.whenStable();
    return fixture;
  }

  it('lista todas las notas', async () => {
    const el = (await montar()).nativeElement as HTMLElement;
    expect(el.querySelectorAll('a.fila').length).toBe(NOTAS.length);
  });

  it('la fila entera es el enlace, no solo el texto', async () => {
    const el = (await montar()).nativeElement as HTMLElement;
    const fila = el.querySelector('a.fila');
    // El nombre y la fecha viven dentro del propio enlace: toda la superficie
    // de la fila abre la nota, sin tener que apuntar a las letras.
    expect(fila?.querySelector('.nm')).toBeTruthy();
    expect(fila?.querySelector('.der')).toBeTruthy();
    expect(el.querySelectorAll('a.fila a, a.fila button').length).toBe(0);
  });

  it('cada nota es un enlace rastreable a su propia ruta', async () => {
    const el = (await montar()).nativeElement as HTMLElement;
    const enlaces = [...el.querySelectorAll<HTMLAnchorElement>('a.fila')];
    expect(enlaces.length).toBe(NOTAS.length);
    for (const n of NOTAS) {
      expect(enlaces.some((a) => a.getAttribute('href') === `/notas/${n.slug}`)).toBe(true);
    }
  });

  it('sin slug abre la más reciente', async () => {
    const el = (await montar()).nativeElement as HTMLElement;
    expect(el.querySelector('.titulo')?.textContent).toContain(NOTAS[0].titulo);
  });

  it('un slug de la ruta abre esa nota', async () => {
    const objetivo = NOTAS[NOTAS.length - 1];
    const el = (await montar(objetivo.slug)).nativeElement as HTMLElement;
    expect(el.querySelector('.titulo')?.textContent).toContain(objetivo.titulo);
  });

  it('un slug inexistente no rompe: cae en la más reciente', async () => {
    const el = (await montar('no-existe')).nativeElement as HTMLElement;
    expect(el.querySelector('.titulo')?.textContent).toContain(NOTAS[0].titulo);
  });

  it('avisa cuando la nota está en borrador', async () => {
    const borrador = NOTAS.find((n) => n.borrador);
    if (!borrador) return;
    const el = (await montar(borrador.slug)).nativeElement as HTMLElement;
    expect(el.querySelector('.aviso')?.textContent).toContain('borrador');
  });

  it('el cuerpo se pinta como HTML, no como texto escapado', async () => {
    const el = (await montar(NOTAS[0].slug)).nativeElement as HTMLElement;
    const cuerpo = el.querySelector('.cuerpo');
    expect(cuerpo?.querySelector('h2')).toBeTruthy();
    expect(cuerpo?.textContent).not.toContain('<h2>');
  });

  it('el color de shiki sobrevive al saneador', async () => {
    const conCodigo = NOTAS.find((n) => (cuerpoDe(n.slug) ?? '').includes('shiki'));
    if (!conCodigo) return;
    const el = (await montar(conCodigo.slug)).nativeElement as HTMLElement;
    const pre = el.querySelector('.cuerpo pre.shiki');
    expect(pre).toBeTruthy();
    // Si Angular saneara el HTML, borraría estos style y el código saldría gris.
    expect(pre?.getAttribute('style')).toBeTruthy();
  });

  it('en compacto abrir una nota trae la ficha al frente', async () => {
    const fixture = await montar();
    const wm = TestBed.inject(Wm);
    wm.compact.set(true);
    wm.register('ls ~/notas');
    wm.register('cat nota');
    wm.focus('ls ~/notas');

    ((fixture.nativeElement as HTMLElement).querySelectorAll('a.fila')[1] as HTMLElement).click();
    await fixture.whenStable();
    expect(wm.focused()).toBe('cat nota');
  });
});

describe('datos de notas', () => {
  it('los comentarios de redacción no llegan al cuerpo', () => {
    for (const n of NOTAS) {
      expect(cuerpoDe(n.slug) ?? '').not.toContain('<!--');
    }
  });
  it('cada nota tiene cuerpo compilado', () => {
    for (const n of NOTAS) expect(cuerpoDe(n.slug)).not.toBeNull();
  });
  it('buscarNota acepta slug con y sin extensión', () => {
    expect(buscarNota(`${NOTAS[0].slug}.md`)?.slug).toBe(NOTAS[0].slug);
  });
  it('las notas van de la más reciente a la más antigua', () => {
    const fechas = NOTAS.map((n) => n.fecha);
    expect([...fechas].sort().reverse()).toEqual(fechas);
  });
});
