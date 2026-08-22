import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, input } from '@angular/core';
import { Wm } from '../core/wm';

/**
 * Una ventana del mosaico. Se anuncia al gestor al montarse, de modo que el
 * orden de las pestañas en compacto es el orden del DOM sin listas paralelas.
 */
@Component({
  selector: 'dbj-pane',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pane',
    '[class.focus]': 'isFocused()',
    '[class.compact-on]': 'isVisible()',
    '(mousedown)': 'wm.focus(title())',
  },
  template: `
    <div class="pane-bar">
      <span class="pane-dots"><i></i><i></i><i></i></span>
      <span class="pane-name">{{ title() }}</span>
    </div>
    <div class="pane-body"><ng-content /></div>
    @if (foot()) {
      <div class="pane-foot"><ng-content select="[pane-foot]" /></div>
    }
  `,
  styles: `
    :host {
      display: flex; flex-direction: column; min-height: 0;
      background: var(--pane); border: 1px solid var(--line);
      border-radius: var(--radius); overflow: hidden;
      transition: border-color 0.15s;
    }
    :host(.focus) { border-color: var(--accent-line); background: var(--pane-hi); }
    .pane-bar {
      display: flex; align-items: center; gap: 9px; padding: 7px 11px; flex: 0 0 auto;
      border-bottom: 1px solid var(--line); font-size: 10.5px;
      color: var(--dim); letter-spacing: 0.06em;
    }
    :host(.focus) .pane-bar { color: var(--fg); }
    .pane-dots { display: flex; gap: 4px; flex: 0 0 auto; }
    .pane-dots i { width: 7px; height: 7px; border-radius: 50%; background: #232b2d; display: block; }
    :host(.focus) .pane-dots i:first-child { background: var(--accent); }
    .pane-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pane-body { flex: 1; min-height: 0; overflow: auto; padding: 13px 15px; }
    .pane-foot {
      flex: 0 0 auto; display: flex; align-items: center; gap: 8px;
      padding: 7px 13px; border-top: 1px solid var(--line);
      font-size: 10px; color: var(--dimmer); background: #090b0c;
    }
    @media (max-width: 820px) { .pane-body { padding: 14px 15px; } }
  `,
})
export class Pane implements OnDestroy {
  protected readonly wm = inject(Wm);

  readonly title = input.required<string>();
  readonly foot = input(false);

  protected readonly isFocused = computed(() => this.wm.focused() === this.title());
  /** En compacto solo se pinta la ventana enfocada. */
  protected readonly isVisible = computed(() => !this.wm.compact() || this.isFocused());

  constructor() {
    // El registro ocurre en el constructor para respetar el orden del DOM.
    queueMicrotask(() => this.wm.register(this.title()));
  }

  ngOnDestroy(): void {
    this.wm.unregister(this.title());
  }
}
