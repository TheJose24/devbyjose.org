import {
  ChangeDetectionStrategy, Component, HostListener, OnInit, PLATFORM_ID,
  effect, inject, signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { Wm, WORKSPACES, type WorkspaceId } from './core/wm';
import { Homelab, ago } from './core/homelab';

@Component({
  selector: 'dbj-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly wm = inject(Wm);
  protected readonly homelab = inject(Homelab);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly workspaces = WORKSPACES;
  private touchX = 0;
  private touchY = 0;

  protected readonly ledClass = signal('on');

  constructor() {
    effect(() => {
      const mode = this.homelab.mode();
      this.ledClass.set(mode === 'live' ? 'on' : mode === 'snapshot' ? 'stale' : 'off');
    });
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.syncCompact();
    void this.homelab.refresh();
  }

  protected goto(id: WorkspaceId): void {
    void this.router.navigate([id === 'inicio' ? '/' : `/${id}`]);
  }

  protected hostLabel(): string {
    const mode = this.homelab.mode();
    if (mode === 'live') return 'homelab activo';
    if (mode === 'snapshot') return 'homelab dormido';
    return 'homelab';
  }

  protected hostTitle(): string {
    const s = this.homelab.status();
    if (this.homelab.mode() === 'live') return 'El homelab responde ahora mismo';
    const when = ago(s.generatedAt);
    return when ? `Último registro ${when}` : 'Último registro conocido';
  }

  @HostListener('window:resize')
  protected syncCompact(): void {
    if (!this.isBrowser) return;
    this.wm.compact.set(window.innerWidth <= Wm.MOBILE_BREAKPOINT);
  }

  @HostListener('window:keydown', ['$event'])
  protected onKey(e: KeyboardEvent): void {
    const el = e.target as HTMLElement | null;
    if (el && /^(INPUT|TEXTAREA)$/.test(el.tagName)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key >= '1' && e.key <= '4') {
      const ws = this.workspaces[Number(e.key) - 1];
      if (ws) this.goto(ws.id);
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      this.wm.step(1);
    }
  }

  protected onTouchStart(e: TouchEvent): void {
    if (!this.wm.compact() || e.touches.length !== 1) return;
    this.touchX = e.touches[0].clientX;
    this.touchY = e.touches[0].clientY;
  }

  protected onTouchEnd(e: TouchEvent): void {
    if (!this.wm.compact()) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - this.touchX;
    const dy = t.clientY - this.touchY;
    // Deslizamiento claramente horizontal; en el extremo no da la vuelta.
    if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    this.wm.step(dx < 0 ? 1 : -1, false);
  }
}
