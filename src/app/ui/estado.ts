import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Pie de la vista pública del homelab. No consulta ni publica datos operativos.
 */
@Component({
  selector: 'dbj-estado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'estado' },
  template: `
    <span class="led stale"></span>
    <span class="amb">vista pública</span>
    <span class="dimmer">·</span><span>operación bajo demanda</span>
  `,
  styles: `
    :host { display: flex; align-items: center; gap: 7px; }
    .led { width: 6px; height: 6px; border-radius: 50%; flex: 0 0 auto; background: var(--accent); }
    .led.stale { background: var(--amber); }
    .led.off { background: var(--red); }
  `,
})
export class Estado {
}
