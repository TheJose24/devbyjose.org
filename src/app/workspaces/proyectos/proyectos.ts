import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Pane } from '../../ui/pane';
import { PROYECTOS, type Proyecto } from '../../data/proyectos';

@Component({
  selector: 'dbj-proyectos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Pane],
  host: { class: 'ws ws-proyectos' },
  templateUrl: './proyectos.html',
})
export class Proyectos {
  protected readonly proyectos = PROYECTOS;
  protected readonly seleccionado = signal<string>(PROYECTOS[0].key);

  protected readonly actual = computed<Proyecto>(
    () => PROYECTOS.find((p) => p.key === this.seleccionado()) ?? PROYECTOS[0],
  );

  protected seleccionar(key: string): void {
    this.seleccionado.set(key);
  }
}
