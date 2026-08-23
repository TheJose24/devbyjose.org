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
const dominio = new URL(cfg.vars.ORIGEN_PERMITIDO).hostname;

describe('wrangler.jsonc', () => {
  it('el remitente vive en el dominio propio', () => {
    // El binding send_email rechaza cualquier `from` que no pertenezca a una
    // zona de la cuenta con Email Routing activo. Un gmail aquí falla en
    // ejecución, nunca en el despliegue.
    expect(cfg.vars.REMITENTE.endsWith(`@${dominio}`)).toBe(true);
  });

  it('el destino no se usa como remitente', () => {
    expect(cfg.vars.REMITENTE).not.toBe(cfg.vars.DESTINO);
  });

  it('la ruta cuelga del mismo dominio que el origen permitido', () => {
    const rutas: { pattern: string; zone_name: string }[] = cfg.routes ?? [];
    expect(rutas.length).toBeGreaterThan(0);
    for (const r of rutas) {
      expect(r.pattern.startsWith(dominio)).toBe(true);
      expect(r.zone_name).toBe(dominio);
    }
  });

  it('el destino de send_email coincide con el buzón que se anuncia', () => {
    expect(cfg.send_email[0].destination_address).toBe(cfg.vars.DESTINO);
  });
});
