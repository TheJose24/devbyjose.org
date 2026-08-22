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
