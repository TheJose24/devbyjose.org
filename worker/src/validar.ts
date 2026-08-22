export interface Mensaje {
  readonly nombre: string;
  readonly email: string;
  readonly mensaje: string;
  /** Campo trampa: invisible en el formulario, solo un bot lo rellena. */
  readonly web?: string;
}

export type Resultado =
  | { readonly ok: true; readonly datos: Mensaje }
  | { readonly ok: false; readonly motivo: string; readonly campo?: string };

const LIMITES = {
  nombre: { min: 2, max: 80 },
  email: { min: 5, max: 160 },
  mensaje: { min: 20, max: 4000 },
} as const;

/** Deliberadamente laxa: rechaza lo evidente sin excluir direcciones válidas raras. */
const EMAIL = /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/;

function texto(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/**
 * Valida el cuerpo del formulario.
 *
 * Devuelve el motivo en lugar de lanzar, para que el manejador decida qué
 * contar al cliente: al campo trampa se le responde éxito, no error, o el bot
 * aprende a esquivarlo.
 */
export function validar(cuerpo: unknown): Resultado {
  if (typeof cuerpo !== 'object' || cuerpo === null) {
    return { ok: false, motivo: 'cuerpo-invalido' };
  }
  const c = cuerpo as Record<string, unknown>;

  if (texto(c['web']).length > 0) return { ok: false, motivo: 'trampa' };

  const nombre = texto(c['nombre']);
  const email = texto(c['email']).toLowerCase();
  const mensaje = texto(c['mensaje']);

  for (const [campo, valor] of [
    ['nombre', nombre],
    ['email', email],
    ['mensaje', mensaje],
  ] as const) {
    const { min, max } = LIMITES[campo];
    if (valor.length < min) return { ok: false, motivo: 'demasiado-corto', campo };
    if (valor.length > max) return { ok: false, motivo: 'demasiado-largo', campo };
  }

  if (!EMAIL.test(email)) return { ok: false, motivo: 'email-invalido', campo: 'email' };

  return { ok: true, datos: { nombre, email, mensaje } };
}

/** Los saltos de línea en una cabecera permitirían inyectar cabeceras propias. */
export function limpiarCabecera(v: string): string {
  return v.replace(/[\r\n]+/g, ' ').slice(0, 120);
}
