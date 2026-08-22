import raw from './notas.json';

export interface Nota {
  readonly slug: string;
  readonly titulo: string;
  readonly fecha: string;
  readonly tags: readonly string[];
  readonly resumen: string;
  readonly minutos: number;
  readonly borrador: boolean;
}

/** Generado por `tools/build-notes.mjs` en prebuild. */
export const NOTAS: readonly Nota[] = raw as readonly Nota[];

export function buscarNota(termino: string): Nota | undefined {
  const t = termino.toLowerCase().replace(/\.md$/, '');
  return NOTAS.find((n) => n.slug === t) ?? NOTAS.find((n) => n.slug.startsWith(t));
}

import cuerpos from './notas-cuerpos.json';

/**
 * Cuerpo ya renderizado de una nota.
 *
 * El HTML lo genera `tools/build-notes.mjs` desde nuestro propio markdown, con
 * markdown-it configurado en `html: false`, así que ninguna etiqueta puede
 * colarse desde el contenido: lo único que hay es lo que emiten markdown-it y
 * shiki. Es la razón por la que la ficha puede marcarlo como confiable, y hace
 * falta hacerlo porque el saneador de Angular borraría los `style` con los que
 * shiki colorea el código.
 */
export function cuerpoDe(slug: string): string | null {
  return (cuerpos as Record<string, string>)[slug] ?? null;
}
