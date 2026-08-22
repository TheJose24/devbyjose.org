import {
  ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Shell, type ShellLine } from '../../core/shell';
import { Wm, routeFor } from '../../core/wm';

@Component({
  selector: 'dbj-zsh',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'zsh' },
  template: `
    <div class="log" #log>
      @for (line of lines(); track $index) {
        <div class="line" [class]="'line ' + line.tone">
          @if (line.label) { <span class="label">{{ line.label }}</span> }
          <span>{{ line.text }}</span>
        </div>
      }
    </div>

    <form class="prompt" (submit)="submit($event)" autocomplete="off">
      <span class="ps1" aria-hidden="true">❯</span>
      <input
        #entrada
        [value]="draft()"
        (input)="draft.set($any($event.target).value)"
        (keydown)="onKey($event)"
        placeholder="help"
        spellcheck="false"
        aria-label="línea de comandos">
    </form>
  `,
  styles: `
    :host { display: contents; }
    .log { display: flex; flex-direction: column; gap: 2px; }
    .line { white-space: pre-wrap; overflow-wrap: anywhere; display: flex; gap: 10px; }
    .line .label { color: var(--dimmer); flex: 0 0 auto; min-width: 74px; white-space: pre; }
    .line.input { color: var(--dimmer); }
    .line.muted { color: var(--dim); }
    .line.ok { color: var(--accent); }
    .line.warn { color: var(--amber); }
    .prompt {
      display: flex; align-items: center; gap: 8px; padding: 9px 15px; flex: 0 0 auto;
      border-top: 1px solid var(--line); background: #090b0c;
      margin: 13px -15px -13px;
    }
    .ps1 { color: var(--accent); }
    input {
      flex: 1; background: none; border: 0; outline: 0; color: var(--fg-hi);
      font: inherit; caret-color: var(--accent);
    }
    input::placeholder { color: var(--dimmer); }
    /* 16px evita que Safari en iOS haga zoom al enfocar el campo. */
    @media (max-width: 820px) { input { font-size: 16px; } }
  `,
})
export class Zsh {
  private readonly shell = new Shell();
  private readonly router = inject(Router);
  private readonly wm = inject(Wm);
  private readonly logEl = viewChild<ElementRef<HTMLElement>>('log');
  private readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('entrada');

  private readonly historial: string[] = [];
  private cursor = 0;

  protected readonly draft = signal('');
  protected readonly lines = signal<readonly ShellLine[]>([
    { tone: 'muted', text: 'devbyjose 2.0 · escribe help para ver los comandos.' },
  ]);

  protected submit(e: Event): void {
    e.preventDefault();
    const entrada = this.draft();
    this.draft.set('');

    const result = this.shell.run(entrada);
    if (!result) return;

    this.historial.push(entrada.trim());
    this.cursor = this.historial.length;

    const eco: ShellLine = { tone: 'input', text: `❯ ${entrada.trim()}` };
    this.lines.update((prev) =>
      result.clear ? [...result.lines] : [...prev, eco, ...result.lines],
    );

    if (result.download) this.descargar(result.download);
    if (result.goto) void this.router.navigate([routeFor(result.goto)]);

    queueMicrotask(() => {
      const el = this.logEl()?.nativeElement.parentElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  protected onKey(e: KeyboardEvent): void {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.cursor > 0) this.draft.set(this.historial[--this.cursor] ?? '');
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.cursor < this.historial.length - 1) this.draft.set(this.historial[++this.cursor] ?? '');
      else { this.cursor = this.historial.length; this.draft.set(''); }
      return;
    }
    if (e.key === 'Tab') {
      // Tab dentro del prompt autocompleta; fuera, el gestor rota de ventana.
      e.preventDefault();
      e.stopPropagation();
      this.autocompletar();
      return;
    }
    if (e.key === 'Escape') this.inputEl()?.nativeElement.blur();
  }

  private autocompletar(): void {
    const actual = this.draft();
    const opciones = this.shell.complete(actual);
    if (opciones.length === 0) return;

    const partes = actual.split(/\s+/);
    if (opciones.length === 1) {
      partes[partes.length - 1] = opciones[0];
      this.draft.set(partes.join(' ') + ' ');
      return;
    }
    // Varias opciones: completa el prefijo común y las enumera, como un shell.
    const comun = opciones.reduce((a, b) => {
      let i = 0;
      while (i < a.length && i < b.length && a[i] === b[i]) i++;
      return a.slice(0, i);
    });
    if (comun.length > (partes[partes.length - 1] ?? '').length) {
      partes[partes.length - 1] = comun;
      this.draft.set(partes.join(' '));
    }
    this.lines.update((prev) => [...prev, { tone: 'muted', text: opciones.join('   ') }]);
  }

  private descargar(href: string): void {
    const a = document.createElement('a');
    a.href = href;
    a.download = '';
    a.click();
  }
}
