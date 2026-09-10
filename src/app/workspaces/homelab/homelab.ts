import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Pane } from '../../ui/pane';
import { TOPOLOGIA } from '../../data/topologia';

@Component({
  selector: 'dbj-homelab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Pane],
  host: { class: 'ws ws-homelab' },
  templateUrl: './homelab.html',
})
export class HomelabWs {
  protected readonly topologia = TOPOLOGIA;
}
