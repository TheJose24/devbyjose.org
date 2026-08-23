import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Pane } from '../../ui/pane';
import { Estado } from '../../ui/estado';
import { Homelab as HomelabService } from '../../core/homelab';
import { TOPOLOGIA } from '../../data/topologia';

@Component({
  selector: 'dbj-homelab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Pane, Estado],
  host: { class: 'ws' },
  templateUrl: './homelab.html',
  styles: `
    :host {
      display: grid; height: 100%; gap: var(--gap);
      grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
      grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
    }
    :host > dbj-pane:first-child { grid-column: 1; grid-row: span 2; }

    .topo { display: flex; flex-direction: column; }
    .nodo { display: flex; align-items: baseline; }
    .rama { white-space: pre; color: var(--line-hi); flex: 0 0 auto; }
    .etiqueta { flex: 0 0 auto; min-width: 11ch; }
    .nota { color: var(--dim); }

    .grande { font-size: 28px; line-height: 1.1; color: var(--fg-hi); }
    .grande small { font-size: 14px; color: var(--dim); }
    .nota-uptime { margin: 6px 0 0; font-size: 12px; line-height: 1.45; }

    @media (max-width: 820px) {
      :host { display: flex; flex-direction: column; }
      .etiqueta { min-width: 10ch; }
    }
  `,
})
export class HomelabWs {
  private readonly homelab = inject(HomelabService);

  protected readonly topologia = TOPOLOGIA;
  protected readonly estado = this.homelab.status;

  /**
   * «4h 29m» o «12d 06:22» → cifra, unidad y resto, para darle a cada parte un
   * tamaño distinto. El servidor se apaga, así que el uptime puede ser de horas
   * y el formato tiene que aguantarlo igual que el de días.
   */
  protected readonly uptime = computed(() => {
    const m = /^(\d+)\s*([a-z]+)\s*(.*)$/i.exec(this.estado().uptimePretty.trim());
    if (!m) return { valor: this.estado().uptimePretty, unidad: '', resto: '' };
    return { valor: m[1], unidad: m[2], resto: m[3] };
  });

  /** Porcentaje de RAM ocupada en el host. */
  protected readonly ram = computed(() => {
    const { usadaGi, totalGi } = this.estado().ram;
    return totalGi > 0 ? Math.round((usadaGi / totalGi) * 100) : 0;
  });
}
