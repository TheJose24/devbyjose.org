import { NOTAS, buscarNota } from '../data/notas';
import { PROYECTOS, buscarProyecto } from '../data/proyectos';
import { HISTORY } from '../data/profile';
import type { WorkspaceId } from './wm';

export type Tone = 'input' | 'text' | 'muted' | 'ok' | 'warn';

export interface ShellLine {
  readonly tone: Tone;
  readonly text: string;
  /** Columna izquierda atenuada, para salidas en formato clave/valor. */
  readonly label?: string;
}

export interface ShellResult {
  readonly lines: readonly ShellLine[];
  /** Espacio al que debe saltar la interfaz, si el comando lo pide. */
  readonly goto?: WorkspaceId;
  /** Vacía el registro antes de escribir `lines`. */
  readonly clear?: boolean;
  /** Recurso que la interfaz debe ofrecer para descarga. */
  readonly download?: string;
}

interface Command {
  readonly name: string;
  readonly args?: string;
  readonly help: string;
  readonly run: (args: readonly string[]) => ShellResult;
}

const out = (text: string, tone: Tone = 'text', label?: string): ShellLine => ({ tone, text, label });
const only = (...lines: ShellLine[]): ShellResult => ({ lines });

const ESPACIOS: Record<string, WorkspaceId> = {
  '1': 'inicio', '2': 'proyectos', '3': 'homelab', '4': 'notas',
  inicio: 'inicio', proyectos: 'proyectos', homelab: 'homelab', notas: 'notas',
};

/**
 * Intérprete del prompt. No toca el DOM ni el enrutador: devuelve líneas y, si
 * hace falta, la intención de navegar. Así se puede probar entero sin montar
 * un componente, y `help` se deriva del registro en vez de repetirlo a mano.
 */
export class Shell {
  private readonly commands = new Map<string, Command>();

  constructor() {
    this.register({
      name: 'help',
      help: 'esta ayuda',
      run: () => ({
        lines: [
          out('comandos', 'muted'),
          ...[...this.commands.values()].map((c) =>
            out(c.help, 'text', '  ' + (c.args ? `${c.name} ${c.args}` : c.name)),
          ),
          out('↑ ↓ recorre el historial · Tab autocompleta', 'muted'),
        ],
      }),
    });

    this.register({
      name: 'whoami',
      help: 'quién soy',
      run: () => only(
        out('Desarrollador Full Stack. Java y Spring Boot en el backend, Angular en el frontend.'),
        out('Administro mi propia infraestructura y sirvo modelos de lenguaje sobre GPU.', 'muted'),
      ),
    });

    this.register({
      name: 'ls',
      args: '[proyectos|notas]',
      help: 'listar proyectos o notas',
      run: (args) => {
        const que = (args[0] ?? 'proyectos').replace(/^~\//, '');
        if (que.startsWith('nota')) {
          return only(...NOTAS.map((n) =>
            out(`${n.resumen.slice(0, 54)}…`, 'text', `${n.slug}.md`)));
        }
        if (que.startsWith('proyecto')) {
          return only(...PROYECTOS.map((p) => out(p.stack, 'text', p.archivo)));
        }
        return only(out(`no existe el directorio: ${que}`, 'warn'));
      },
    });

    this.register({
      name: 'cat',
      args: '<archivo>',
      help: 'leer una nota o un proyecto',
      run: (args) => {
        const termino = args[0];
        if (!termino) return only(out('uso: cat <archivo>', 'warn'));

        const nota = buscarNota(termino);
        if (nota) {
          return only(
            out(nota.titulo, 'ok'),
            out(`${nota.fecha} · ${nota.tags.join(' · ')} · ${nota.minutos} min`, 'muted'),
            out(nota.resumen),
            ...(nota.borrador ? [out('esta nota está en borrador', 'warn')] : []),
          );
        }

        const proy = buscarProyecto(termino);
        if (proy) {
          return {
            lines: [
              out(proy.titulo, 'ok'),
              out(proy.stack, 'muted'),
              out(proy.resumen),
              ...(proy.repo ? [out(proy.repo, 'ok', '  repo')] : []),
            ],
            goto: 'proyectos',
          };
        }

        return only(out(`no existe: ${termino}`, 'warn'));
      },
    });

    this.register({
      name: 'cd',
      args: '<espacio>',
      help: 'cambiar de espacio de trabajo',
      run: (args) => {
        const destino = ESPACIOS[(args[0] ?? '').replace(/^~\/?/, '')];
        if (!destino) return only(out(`espacio desconocido: ${args[0] ?? ''}`, 'warn'));
        return { lines: [out(`~/${destino}`, 'muted')], goto: destino };
      },
    });

    this.register({
      name: 'homelab',
      help: 'estado de la infraestructura',
      run: () => ({ lines: [out('abriendo la topología…', 'muted')], goto: 'homelab' }),
    });

    this.register({
      name: 'history',
      help: 'trayectoria',
      run: () => only(...HISTORY.map((h) =>
        out(h.command + (h.note ? `   # ${h.note}` : ''), 'text', h.when))),
    });

    this.register({
      name: 'cv',
      help: 'descargar el CV',
      run: () => ({ lines: [out('cv-jose-sanchez.pdf', 'ok', '  descargando')], download: '/cv.pdf' }),
    });

    this.register({
      name: 'contacto',
      help: 'cómo escribirme',
      run: () => only(
        out('devbyjose@gmail.com', 'ok', 'email'),
        out('in/devbyjose', 'ok', 'linkedin'),
        out('TheJose24', 'ok', 'github'),
      ),
    });

    this.register({
      name: 'clear',
      help: 'limpiar la pantalla',
      run: () => ({ lines: [], clear: true }),
    });
  }

  private register(cmd: Command): void {
    this.commands.set(cmd.name, cmd);
  }

  get names(): readonly string[] {
    return [...this.commands.keys()];
  }

  run(input: string): ShellResult | null {
    const linea = input.trim();
    if (!linea) return null;

    const [nombre, ...args] = linea.split(/\s+/);
    const cmd = this.commands.get(nombre.toLowerCase());
    if (cmd) return cmd.run(args);

    // `ws` es un alias frecuente de `cd` en gestores en mosaico.
    if (nombre.toLowerCase() === 'ws') return this.commands.get('cd')!.run(args);

    const cerca = this.names.find((n) => n.startsWith(nombre.toLowerCase().slice(0, 2)));
    return only(out(
      `comando no encontrado: ${nombre}${cerca ? ` — ¿querías decir ${cerca}?` : ' — prueba help'}`,
      'warn',
    ));
  }

  /** Autocompletado con Tab: comandos, y argumentos de `cat` y `cd`. */
  complete(input: string): readonly string[] {
    const partes = input.split(/\s+/);
    if (partes.length <= 1) {
      const p = (partes[0] ?? '').toLowerCase();
      return this.names.filter((n) => n.startsWith(p));
    }
    const cmd = partes[0].toLowerCase();
    const arg = partes[partes.length - 1].toLowerCase();
    if (cmd === 'cat') {
      return [
        ...NOTAS.map((n) => `${n.slug}.md`),
        ...PROYECTOS.map((p) => p.archivo),
      ].filter((c) => c.startsWith(arg));
    }
    if (cmd === 'cd' || cmd === 'ws') {
      return Object.keys(ESPACIOS).filter((k) => k.length > 1 && k.startsWith(arg));
    }
    return [];
  }
}
