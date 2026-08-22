import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Pane } from '../../ui/pane';
import { Zsh } from './zsh';
import { ASCII_NAME, BIO, BIO_TAIL, HISTORY, PALETTE, SPECS } from '../../data/profile';

@Component({
  selector: 'dbj-inicio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Pane, Zsh],
  host: { class: 'ws ws-inicio' },
  templateUrl: './inicio.html',
  styles: `
    :host {
      display: grid; height: 100%; gap: var(--gap);
      grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
      grid-template-rows: minmax(0, 1.25fr) minmax(0, 1fr);
    }
    :host > dbj-pane:first-child { grid-column: 1; grid-row: span 2; }
    .swatch { display: flex; margin-top: 11px; }
    .swatch i { display: block; width: 21px; height: 10px; }
    .hist { display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 2px 12px; margin: 0; }
    .hist dt { color: var(--dimmer); }
    .hist dd { margin: 0; color: var(--fg); }
    .hist dd em { font-style: normal; color: var(--dimmer); }
    @media (max-width: 820px) {
      :host { display: flex; flex-direction: column; }
      .hist { grid-template-columns: 58px minmax(0, 1fr); }
    }
  `,
})
export class Inicio {
  protected readonly ascii = ASCII_NAME;
  protected readonly specs = SPECS;
  protected readonly palette = PALETTE;
  protected readonly bio = BIO;
  protected readonly bioTail = BIO_TAIL;
  protected readonly history = HISTORY;
}
