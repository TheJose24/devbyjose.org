import { Injectable, computed, signal } from '@angular/core';

export type WorkspaceId = 'inicio' | 'proyectos' | 'homelab' | 'notas';

export interface WorkspaceMeta {
  readonly id: WorkspaceId;
  readonly path: string;
}

export const WORKSPACES: readonly WorkspaceMeta[] = [
  { id: 'inicio', path: '~/inicio' },
  { id: 'proyectos', path: '~/proyectos' },
  { id: 'homelab', path: '~/homelab' },
  { id: 'notas', path: '~/notas' },
] as const;

/**
 * Estado del gestor de ventanas.
 *
 * Dos modos: en escritorio las ventanas se muestran en mosaico y una tiene el
 * foco; por debajo de `MOBILE_BREAKPOINT` solo hay una visible y se cicla entre
 * ellas, igual que un gestor en mosaico real cuando se queda sin espacio.
 */
@Injectable({ providedIn: 'root' })
export class Wm {
  static readonly MOBILE_BREAKPOINT = 820;

  /** Ventanas registradas por el espacio activo, en orden de aparición. */
  private readonly panes = signal<readonly string[]>([]);

  readonly workspace = signal<WorkspaceId>('inicio');
  readonly focused = signal<string | null>(null);
  readonly compact = signal(false);

  readonly path = computed(
    () => WORKSPACES.find((w) => w.id === this.workspace())?.path ?? '~',
  );
  readonly tabs = computed(() => this.panes());
  readonly title = computed(() => {
    const f = this.focused();
    return f ? `${this.path()} · ${f}` : this.path();
  });

  goto(id: WorkspaceId): void {
    if (this.workspace() === id) return;
    this.workspace.set(id);
    this.panes.set([]);
    this.focused.set(null);
  }

  /** Cada ventana se anuncia al montarse; la primera se lleva el foco. */
  register(title: string): void {
    this.panes.update((list) => (list.includes(title) ? list : [...list, title]));
    if (this.focused() === null) this.focused.set(title);
  }

  unregister(title: string): void {
    this.panes.update((list) => list.filter((t) => t !== title));
    if (this.focused() === title) this.focused.set(this.panes()[0] ?? null);
  }

  focus(title: string): void {
    if (this.panes().includes(title)) this.focused.set(title);
  }

  /** Avanza o retrocede entre ventanas. En compacto no da la vuelta: el gesto
   *  de deslizar en el extremo no debe saltar al otro lado. */
  step(delta: number, wrap = true): void {
    const list = this.panes();
    if (list.length < 2) return;
    const at = list.indexOf(this.focused() ?? list[0]);
    const next = at + delta;
    if (next < 0 || next >= list.length) {
      if (!wrap) return;
      this.focused.set(list[(next + list.length) % list.length]);
      return;
    }
    this.focused.set(list[next]);
  }
}
