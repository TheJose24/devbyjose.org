import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Pane } from '../../ui/pane';
import { Zsh } from './zsh';
import {
  ASCII_NAME,
  HISTORY,
  HOME_CONTACT,
  HOME_EDUCATION,
  HOME_EVIDENCE,
  HOME_EXPERIENCE,
  HOME_HERO,
  HOME_HOMELAB,
  HOME_PROJECTS,
  HOME_SKILLS,
  PALETTE,
  PROFESSIONAL_LINKS,
  TECHNICAL_SPECS,
} from '../../data/profile';

@Component({
  selector: 'dbj-inicio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Pane, RouterLink, Zsh],
  host: { class: 'ws ws-inicio' },
  templateUrl: './inicio.html',
})
export class Inicio {
  protected readonly ascii = ASCII_NAME;
  protected readonly specs = TECHNICAL_SPECS;
  protected readonly palette = PALETTE;
  protected readonly history = HISTORY;
  protected readonly hero = HOME_HERO;
  protected readonly evidence = HOME_EVIDENCE;
  protected readonly experience = HOME_EXPERIENCE;
  protected readonly projects = HOME_PROJECTS;
  protected readonly skills = HOME_SKILLS;
  protected readonly homelab = HOME_HOMELAB;
  protected readonly education = HOME_EDUCATION;
  protected readonly contact = HOME_CONTACT;
  protected readonly links = PROFESSIONAL_LINKS;
}
