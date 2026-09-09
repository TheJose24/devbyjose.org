import { TestBed } from '@angular/core/testing';
import { HomelabWs } from './homelab';
import { Homelab } from '../../core/homelab';
import { TOPOLOGIA } from '../../data/topologia';

describe('Homelab', () => {
  async function montar() {
    await TestBed.configureTestingModule({ imports: [HomelabWs] }).compileComponents();
    const fixture = TestBed.createComponent(HomelabWs);
    await fixture.whenStable();
    return fixture;
  }

  it('dibuja la topología completa', async () => {
    const el = (await montar()).nativeElement as HTMLElement;
    expect(el.querySelectorAll('.nodo').length).toBe(TOPOLOGIA.length);
    expect(el.textContent).toContain('cloudflared');
    expect(el.textContent).toContain('proxmox-ve');
  });

  it('lista únicamente categorías públicas generalizadas', async () => {
    const fixture = await montar();
    const servicios = TestBed.inject(Homelab).status().services;
    const filas = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');
    expect(filas.length).toBe(servicios.length);
    expect(filas[0].textContent).toContain(servicios[0].name);
    expect(filas[0].textContent).toContain(servicios[0].detail);
  });

  it('no publica datos operativos ni promete disponibilidad', async () => {
    const el = (await montar()).nativeElement as HTMLElement;
    expect(el.textContent).toContain('bajo demanda');
    expect(el.textContent).toContain('no publica datos operativos');
    expect(el.textContent).not.toMatch(/\d+(\.\d+)?\s*% disponibilidad/);
    expect(el.textContent).not.toContain('docker ps');
  });

  it('cada panel declara que es una vista pública', async () => {
    const el = (await montar()).nativeElement as HTMLElement;
    expect(el.querySelectorAll('dbj-estado').length).toBe(2);
    expect(el.textContent).toContain('vista pública');
  });

  it('conserva las tecnologías públicas autorizadas', async () => {
    const texto = (await montar()).nativeElement.textContent as string;
    for (const tecnologia of ['Proxmox VE', 'VM', 'LXC', 'Docker', 'Tailscale', 'Cloudflare Tunnel']) {
      expect(texto).toContain(tecnologia);
    }
  });

  it('no incorpora estado operativo por servicio', () => {
    const servicios = TestBed.inject(Homelab).status().services;
    for (const servicio of servicios) {
      expect(Object.keys(servicio).sort()).toEqual(['detail', 'name']);
    }
  });

  it('no muestra endpoint, capacidades ni identificadores', async () => {
    const texto = (await montar()).nativeElement.textContent as string;
    expect(texto).not.toContain('/api/homelab');
    expect(texto).not.toMatch(/\b\d+\s*(?:GB|GiB|TB|TiB)\b/i);
    expect(texto).not.toMatch(/\b(?:VM|CT|LXC)[ -]?\d{2,}\b/i);
  });
});

describe('TOPOLOGIA', () => {
  it('todo nodo con nota tiene también texto', () => {
    for (const n of TOPOLOGIA) {
      if (n.nota) expect(n.texto.length).toBeGreaterThan(0);
    }
  });
  it('no expone puertos: el túnel es saliente', () => {
    const tuneles = TOPOLOGIA.filter((n) => n.texto === 'cloudflared');
    expect(tuneles.length).toBeGreaterThanOrEqual(1);
    expect(tuneles.some((t) => t.nota?.includes('sin port forwarding desde Internet'))).toBe(true);
  });

  it('limita el túnel a servicios web seleccionados', () => {
    const tuneles = TOPOLOGIA.filter((n) => n.texto === 'cloudflared');
    expect(tuneles.some((t) => t.nota?.includes('sin port forwarding desde Internet'))).toBe(true);
    expect(TOPOLOGIA.some((n) => n.nota?.includes('aplicaciones y herramientas personales'))).toBe(true);
  });
  it('no nombra servicios que no existen en el servidor', () => {
    // dokploy llegó a estar aquí sin correr nunca en la máquina.
    const textos = TOPOLOGIA.map((n) => n.texto);
    expect(textos).not.toContain('dokploy');
  });
});
