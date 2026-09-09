import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Pane } from '../../ui/pane';
import { Zsh } from './zsh';
import {
  ASCII_NAME, BIO, BIO_TAIL, HISTORY, PALETTE, PROFESSIONAL_LINKS, SPECS,
} from '../../data/profile';

@Component({
  selector: 'dbj-inicio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Pane, RouterLink, Zsh],
  host: { class: 'ws ws-inicio' },
  templateUrl: './inicio.html',
  styles: `
    :host {
      display: grid; height: 100%; gap: var(--gap);
      grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
      grid-template-rows: minmax(0, 1.25fr) minmax(0, 1fr);
    }
    :host > dbj-pane:first-child { grid-column: 1; grid-row: span 2; }
    .perfil-titulo { margin-bottom: 12px; }
    .perfil-titulo h1 { margin: 0; color: var(--fg-hi); font-size: 20px; line-height: 1.25; font-weight: 500; }
    .perfil-titulo p { margin: 3px 0 0; color: var(--accent); }
    .swatch { display: flex; margin-top: 11px; }
    .swatch i { display: block; width: 21px; height: 10px; }
    .hist { display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 2px 12px; margin: 0; }
    .hist dt { color: var(--dimmer); }
    .hist dd { margin: 0; color: var(--fg); }
    .hist dd em { font-style: normal; color: var(--dimmer); }
    .acciones { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 13px; }
    .accion {
      display: inline-flex; align-items: center; min-height: 38px; padding: 7px 10px;
      border: 1px solid var(--line-hi); border-radius: var(--radius-sm); color: var(--fg);
      background: #101415;
    }
    .accion.principal { border-color: var(--accent-line); color: var(--accent); background: var(--accent-soft); }
    @media (max-width: 820px) {
      :host { display: block; height: auto; }
      .hist { grid-template-columns: 58px minmax(0, 1fr); }
      .accion { min-height: 44px; }
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
  protected readonly links = PROFESSIONAL_LINKS;
}
