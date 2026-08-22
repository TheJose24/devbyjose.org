import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Pane } from '../../ui/pane';
import { Wm } from '../../core/wm';
import { NOTAS, cuerpoDe, type Nota } from '../../data/notas';

@Component({
  selector: 'dbj-notas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Pane],
  host: { class: 'ws' },
  templateUrl: './notas.html',
  styles: `
    :host {
      display: grid; height: 100%; gap: var(--gap);
      grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
    }
    .titulo { font-size: 17px; line-height: 1.35; color: var(--fg-hi); margin-bottom: 6px; }
    .meta { color: var(--dimmer); margin-bottom: 14px; }
    .aviso {
      border-left: 2px solid var(--amber); padding: 6px 0 6px 12px;
      color: var(--amber); margin-bottom: 14px;
    }
    /* El cuerpo llega como HTML del compilador de markdown. */
    .cuerpo :is(h2, h3) { color: var(--fg-hi); font-size: 14px; margin: 20px 0 8px; font-weight: 500; }
    .cuerpo h2::before { content: "## "; color: var(--dimmer); }
    .cuerpo h3::before { content: "### "; color: var(--dimmer); }
    .cuerpo p { margin: 0 0 11px; }
    .cuerpo :is(ul, ol) { margin: 0 0 11px; padding-left: 18px; }
    .cuerpo li { margin-bottom: 4px; }
    .cuerpo code { color: var(--accent); }
    .cuerpo pre {
      background: #0d1117; border: 1px solid var(--line); border-radius: var(--radius-sm);
      padding: 12px 14px; margin: 0 0 13px; overflow-x: auto; font-size: 11.5px;
    }
    .cuerpo pre code { color: inherit; }
    .cuerpo :is(blockquote) { margin: 0 0 11px; padding-left: 12px; border-left: 2px solid var(--line-hi); color: var(--dim); }
    .vacio { color: var(--dim); }

    @media (max-width: 820px) { :host { display: flex; flex-direction: column; } }
  `,
})
export class Notas {
  private readonly router = inject(Router);
  private readonly wm = inject(Wm);
  private readonly sanitizer = inject(DomSanitizer);

  /** Llega de la ruta `/notas/:slug`; vacío en `/notas`. */
  readonly slug = input<string>('');

  protected readonly notas = NOTAS;

  protected readonly actual = computed<Nota>(
    () => NOTAS.find((n) => n.slug === this.slug()) ?? NOTAS[0],
  );

  protected readonly cuerpo = computed(() => {
    const html = cuerpoDe(this.actual().slug);
    if (!html) return null;
    // Confiable por construcción: lo genera nuestro compilador de markdown con
    // `html: false`. Sin esto, el saneador borra los `style` de shiki y el
    // código pierde el color.
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  protected abrir(slug: string): void {
    void this.router.navigate(['/notas', slug]);
    if (this.wm.compact()) this.wm.focus('cat nota');
  }
}
