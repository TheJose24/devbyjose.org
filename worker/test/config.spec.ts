import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Quita los comentarios de línea de un JSONC sin romper las cadenas: un
 * `//` dentro de `"https://…"` no abre un comentario.
 */
function sinComentarios(texto: string): string {
  let fuera = '';
  let enCadena = false;
  let escapado = false;

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (enCadena) {
      fuera += c;
      if (escapado) escapado = false;
      else if (c === '\\') escapado = true;
      else if (c === '"') enCadena = false;
      continue;
    }
    if (c === '"') {
      enCadena = true;
      fuera += c;
      continue;
    }
    if (c === '/' && texto[i + 1] === '/') {
      while (i < texto.length && texto[i] !== '\n') i++;
      fuera += '\n';
      continue;
    }
    fuera += c;
  }
  return fuera;
}

const cfg = JSON.parse(sinComentarios(readFileSync('wrangler.jsonc', 'utf8')));
const origenes: string[] = cfg.vars.ORIGENES_PERMITIDOS.split(',').map((o: string) => o.trim());
/** El host que sirve el sitio. Puede ser un subdominio, como www. */
const host = new URL(origenes[0]).hostname;
/**
 * La zona del dominio, que no es lo mismo que el host: el sitio vive en
 * www.ejemplo.org pero el correo y las rutas cuelgan de ejemplo.org.
 * Se toma de la propia configuración en vez de recortar el host, porque
 * recortar falla con dominios de dos niveles como .com.pe.
 */
const zona: string = cfg.routes[0].zone_name;

describe('wrangler.jsonc', () => {
  it('el remitente vive en la zona propia', () => {
    // El binding send_email rechaza cualquier `from` que no pertenezca a una
    // zona de la cuenta con Email Routing activo. Un gmail aquí falla en
    // ejecución, nunca en el despliegue.
    expect(cfg.vars.REMITENTE.endsWith(`@${zona}`)).toBe(true);
  });

  it('el destino no se usa como remitente', () => {
    expect(cfg.vars.REMITENTE).not.toBe(cfg.vars.DESTINO);
  });

  it('cada origen permitido tiene su ruta', () => {
    const rutas: { pattern: string; zone_name: string }[] = cfg.routes ?? [];
    expect(rutas.length).toBeGreaterThan(0);
    // Una ruta casa con el host exacto: sin la de www, el formulario devuelve
    // 404 desde www aunque el CORS lo permita.
    for (const origen of origenes) {
      const host = new URL(origen).hostname;
      expect(rutas.some((r) => r.pattern.startsWith(`${host}/`))).toBe(true);
    }
  });

  it('todas las rutas viven en la misma zona y atienden /api', () => {
    for (const r of cfg.routes ?? []) {
      expect(r.zone_name).toBe(zona);
      expect(r.pattern.endsWith('/api/*')).toBe(true);
    }
  });

  it('los origenes permitidos son https y cuelgan de la zona', () => {
    for (const o of origenes) {
      const u = new URL(o);
      expect(u.protocol).toBe('https:');
      expect(u.hostname === zona || u.hostname.endsWith(`.${zona}`)).toBe(true);
    }
  });

  it('el host canonico tiene ruta propia', () => {
    const rutas: { pattern: string }[] = cfg.routes ?? [];
    expect(rutas.some((r) => r.pattern.startsWith(`${host}/`))).toBe(true);
  });

  it('el destino de send_email coincide con el buzón que se anuncia', () => {
    expect(cfg.send_email[0].destination_address).toBe(cfg.vars.DESTINO);
  });

  it('hay una ventana corta y una larga', () => {
    const limitadores: { name: string; simple: { limit: number; period: number } }[] =
      cfg.ratelimits ?? [];
    // Con una sola ventana de 60 s la ráfaga entra entera: el contador de
    // Cloudflare es aproximado y tarda en propagarse.
    expect(limitadores.length).toBeGreaterThanOrEqual(2);
    expect(limitadores.some((l) => l.simple.period === 10)).toBe(true);
    expect(limitadores.some((l) => l.simple.period === 60)).toBe(true);
  });

  it('cada limitador tiene su propio espacio de nombres', () => {
    const ids = (cfg.ratelimits ?? []).map((l: { namespace_id: string }) => l.namespace_id);
    // Compartir namespace_id haría que ambos contaran sobre el mismo contador.
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('la ventana corta es mas estricta que la larga', () => {
    const limitadores: { simple: { limit: number; period: number } }[] = cfg.ratelimits ?? [];
    const corta = limitadores.find((l) => l.simple.period === 10)!;
    const larga = limitadores.find((l) => l.simple.period === 60)!;
    expect(corta.simple.limit).toBeLessThan(larga.simple.limit);
  });
});
