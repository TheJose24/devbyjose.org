import { ChangeDetectionStrategy, Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Homelab, ago } from '../core/homelab';

/**
 * Antigüedad del dato del homelab.
 *
 * Se pinta la fecha absoluta en el servidor y la relativa solo tras hidratar:
 * calcular «hace 3 h» durante el prerenderizado la congelaría en el HTML, y
 * además provocaría una discrepancia al hidratar.
 */
@Component({
  selector: 'dbj-estado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'estado' },
  template: `
    <span class="led" [class]="'led ' + tono()"></span>
    <span [class]="texto().clase">{{ texto().etiqueta }}</span>
    @if (detalle(); as d) {
      <span class="dimmer">·</span><span>{{ d }}</span>
    }
  `,
  styles: `
    :host { display: flex; align-items: center; gap: 7px; }
    .led { width: 6px; height: 6px; border-radius: 50%; flex: 0 0 auto; background: var(--accent); }
    .led.stale { background: var(--amber); }
    .led.off { background: var(--red); }
  `,
})
export class Estado {
  private readonly homelab = inject(Homelab);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly relativo = signal<string | null>(null);

  protected readonly tono = computed(() => {
    const m = this.homelab.mode();
    return m === 'live' ? 'on' : m === 'snapshot' ? 'stale' : 'off';
  });

  protected readonly texto = computed(() => {
    const m = this.homelab.mode();
    if (m === 'live') return { etiqueta: 'en vivo', clase: 'ok' };
    if (m === 'snapshot') return { etiqueta: 'último registro', clase: 'amb' };
    return { etiqueta: 'sin datos', clase: 'red' };
  });

  protected readonly detalle = computed(() => {
    if (this.homelab.mode() === 'live') return null;
    return this.relativo() ?? this.homelab.status().generatedAt.slice(0, 16).replace('T', ' ');
  });

  constructor() {
    if (!this.isBrowser) return;
    queueMicrotask(() => this.relativo.set(ago(this.homelab.status().generatedAt)));
  }
}
