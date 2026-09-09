import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Pane } from '../../ui/pane';
import { Wm } from '../../core/wm';
import { PROYECTOS, type Proyecto } from '../../data/proyectos';

@Component({
  selector: 'dbj-proyectos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Pane],
  host: { class: 'ws' },
  templateUrl: './proyectos.html',
  styles: `
    :host {
      display: grid; height: 100%; gap: var(--gap);
      grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
    }
    .por-que { color: var(--dim); font-size: inherit; font-weight: 400; margin: 0 0 6px; }
    .titulo { font-size: 16px; font-weight: 500; color: var(--fg-hi); margin: 0 0 7px; }
    .sub-res { color: var(--dim); }
    .repos { display: flex; flex-wrap: wrap; gap: 8px 18px; }
    .repo { display: inline-flex; min-height: 38px; align-items: center; color: var(--accent); }
    .vivo { color: var(--accent); }
    @media (max-width: 820px) {
      :host { display: block; height: auto; }
      .kv { grid-template-columns: minmax(0, 1fr); gap: 0; }
      .kv dt { margin-top: 12px; }
      .kv dt:first-child { margin-top: 0; }
      .kv dd { margin-top: 2px; overflow-wrap: anywhere; }
      .repo { min-height: 44px; }
    }
  `,
})
export class Proyectos {
  private readonly wm = inject(Wm);

  protected readonly proyectos = PROYECTOS;
  protected readonly seleccionado = signal<string>(PROYECTOS[0].key);

  protected readonly actual = computed<Proyecto>(
    () => PROYECTOS.find((p) => p.key === this.seleccionado()) ?? PROYECTOS[0],
  );

  protected seleccionar(key: string): void {
    this.seleccionado.set(key);
    // En compacto la ficha está en otra pestaña: hay que traerla al frente,
    // o el toque en la lista parece no hacer nada.
    if (this.wm.compact()) this.wm.focus('cat README');
  }
}
