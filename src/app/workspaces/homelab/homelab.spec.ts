import { TestBed } from '@angular/core/testing';
import { HomelabWs } from './homelab';
import { TOPOLOGIA } from '../../data/topologia';
import { Wm } from '../../core/wm';

describe('Homelab', () => {
  async function montar() {
    await TestBed.configureTestingModule({ imports: [HomelabWs] }).compileComponents();
    const fixture = TestBed.createComponent(HomelabWs);
    await fixture.whenStable();
    return fixture;
  }

  it('presenta un único h1 y posiciona el homelab como proyecto personal', async () => {
    const el = (await montar()).nativeElement as HTMLElement;
    const headings = el.querySelectorAll('h1');

    expect(headings.length).toBe(1);
    expect(headings[0].textContent?.trim()).toBe('Homelab');
    expect(el.querySelector('.homelab-kicker')?.textContent).toContain('Proyecto personal');
    expect(el.querySelector('.homelab-intro')?.textContent).toContain(
      'despliegue, aislamiento, redes privadas y operación de servicios bajo demanda',
    );
    expect(el.querySelector('.purpose-section')?.textContent).toContain('no representa experiencia laboral');
  });

  it('mantiene la estructura editorial profesional completa', async () => {
    const el = (await montar()).nativeElement as HTMLElement;
    expect([...el.querySelectorAll('.homelab-section > .section-heading h2')]
      .map((heading) => heading.textContent?.trim())).toEqual([
        'Qué es',
        'Qué decisiones practico',
        'Decisiones de plataforma',
        'Red y acceso',
        'Operación bajo demanda',
        'Qué habilidades demuestra',
        'Stack',
        'Relación con mi trabajo de software',
      ]);
    expect(el.querySelector('.topology-section h2')?.textContent?.trim()).toBe('Arquitectura general');
  });

  it('explica VM, LXC y Docker como decisiones distintas, no como ranking', async () => {
    const el = (await montar()).nativeElement as HTMLElement;
    const plataformas = [...el.querySelectorAll('.platform-grid article')];

    expect(plataformas.length).toBe(3);
    expect(plataformas.map((card) => card.querySelector('.platform-name')?.textContent?.trim()))
      .toEqual(['VM', 'LXC', 'Docker']);
    expect(plataformas[0].textContent).toContain('Mayor aislamiento');
    expect(plataformas[1].textContent).toContain('Menor sobrecarga');
    expect(plataformas[2].textContent).toContain('ejecución consistente');
    expect(plataformas.map((card) => card.textContent).join(' ')).not.toMatch(/la mejor|superior a/i);
  });

  it('conserva la topología pública como evidencia secundaria', async () => {
    const el = (await montar()).nativeElement as HTMLElement;
    expect(el.querySelectorAll('.topology-node').length).toBe(TOPOLOGIA.length);
    expect(el.querySelector('.topology-card figcaption')?.textContent).toContain('Vista pública sanitizada');
    expect(el.querySelector('.topology-context')?.textContent).toContain('No representa estado en vivo');
  });

  it('conserva las tecnologías públicas autorizadas', async () => {
    const texto = (await montar()).nativeElement.textContent as string;
    for (const tecnologia of ['Proxmox VE', 'VM', 'LXC', 'Docker', 'Linux', 'Tailscale', 'Cloudflare Tunnel']) {
      expect(texto).toContain(tecnologia);
    }
    expect(texto).toContain('sin port forwarding desde Internet');
  });

  it('explica una sola operación personal sin dashboard ni promesas de uptime', async () => {
    const el = (await montar()).nativeElement as HTMLElement;
    expect(el.querySelectorAll('.demand-section').length).toBe(1);
    expect(el.querySelector('.demand-section')?.textContent).toContain('sin promesas de disponibilidad');
    expect(el.querySelectorAll('table, dbj-estado, [role="status"]').length).toBe(0);
    expect(el.textContent).not.toContain('docker ps');
    expect(el.textContent).not.toMatch(/\d+(?:[.,]\d+)?\s*%\s*(?:uptime|disponibilidad)/i);
  });

  it('relaciona el criterio operativo con desarrollo sin branding sysadmin o DevOps', async () => {
    const el = (await montar()).nativeElement as HTMLElement;
    const relacion = el.querySelector('.software-section')?.textContent ?? '';
    expect(relacion).toContain('backend y full stack');
    expect(relacion).toContain('desarrollo de software');
    expect(el.textContent).not.toMatch(/DevOps Engineer|System Administrator|Sysadmin/i);
  });

  it('usa un solo panel y flujo semántico sin tablas estrechas', async () => {
    const el = (await montar()).nativeElement as HTMLElement;
    expect(el.querySelectorAll('dbj-pane').length).toBe(1);
    expect(el.querySelectorAll('.homelab-section').length).toBe(9);
    expect(el.querySelector('table')).toBeNull();
    expect(el.querySelector('dl.kv')).toBeNull();
  });

  it('mantiene un nombre accesible cuando el panel único no usa tabs en mobile', async () => {
    await TestBed.configureTestingModule({ imports: [HomelabWs] }).compileComponents();
    TestBed.inject(Wm).compact.set(true);
    const fixture = TestBed.createComponent(HomelabWs);
    await fixture.whenStable();
    const pane = (fixture.nativeElement as HTMLElement).querySelector('dbj-pane');

    expect(pane?.getAttribute('role')).toBe('region');
    expect(pane?.getAttribute('aria-label')).toBe('homelab');
    expect(pane?.getAttribute('aria-labelledby')).toBeNull();
  });

  it('no expone disclosure prohibido', async () => {
    const texto = (await montar()).nativeElement.textContent as string;
    expect(texto).not.toContain('/api/homelab');
    expect(texto).not.toMatch(/\b\d+\s*(?:GB|GiB|TB|TiB)\b/i);
    expect(texto).not.toMatch(/\b(?:VM|CT|LXC)[ -]?\d{2,}\b/i);
    expect(texto).not.toMatch(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
    expect(texto).not.toMatch(/0 puertos expuestos/i);
  });
});

describe('TOPOLOGIA', () => {
  it('todo nodo con nota tiene también texto', () => {
    for (const nodo of TOPOLOGIA) {
      if (nodo.nota) expect(nodo.texto.length).toBeGreaterThan(0);
    }
  });

  it('describe publicación selectiva sin exponer puertos ni servicios internos', () => {
    const tuneles = TOPOLOGIA.filter((nodo) => nodo.texto === 'cloudflared');
    const contenido = JSON.stringify(TOPOLOGIA);

    expect(tuneles.length).toBeGreaterThanOrEqual(1);
    expect(tuneles.some((tunel) => tunel.nota?.includes('sin port forwarding desde Internet'))).toBe(true);
    expect(contenido).not.toContain('dns ·');
    expect(contenido).not.toContain('dokploy');
  });
});
