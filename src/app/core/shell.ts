import { NOTAS, buscarNota } from '../data/notas';
import { NOTAS_PUBLICADAS } from './wm';
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

export interface Borrador {
  readonly nombre: string;
  readonly email: string;
  readonly mensaje: string;
}

export interface ShellResult {
  readonly lines: readonly ShellLine[];
  /** Mensaje listo para que la interfaz lo envíe al Worker. */
  readonly enviar?: Borrador;
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

/**
 * Límites del formulario. Los define el Worker, que es la autoridad; aquí se
 * repiten solo para avisar antes de gastar una petición.
 * Fuente: `worker/src/validar.ts`.
 */
const LIMITES = {
  nombre: { min: 2, max: 80 },
  email: { min: 5, max: 160 },
  mensaje: { min: 20, max: 4000 },
} as const;
const EMAIL = /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/;

type PasoMail = 'nombre' | 'email' | 'mensaje' | 'confirmar';

const PREGUNTA: Record<PasoMail, string> = {
  nombre: '¿cómo te llamas?',
  email: '¿a qué correo te respondo?',
  mensaje: 'cuéntame (una línea)',
  confirmar: '¿lo envío? [si/no]',
};

const ESPACIOS: Record<string, WorkspaceId> = {
  '1': 'inicio', '2': 'proyectos', '3': 'homelab',
  inicio: 'inicio', proyectos: 'proyectos', homelab: 'homelab',
  // `notas` solo existe como destino cuando el espacio está publicado.
  ...(NOTAS_PUBLICADAS ? { '4': 'notas' as const, notas: 'notas' as const } : {}),
};

/**
 * Intérprete del prompt. No toca el DOM ni el enrutador: devuelve líneas y, si
 * hace falta, la intención de navegar. Así se puede probar entero sin montar
 * un componente, y `help` se deriva del registro en vez de repetirlo a mano.
 */
export class Shell {
  private readonly commands = new Map<string, Command>();
  private borrador: { paso: PasoMail; nombre: string; email: string; mensaje: string } | null = null;

  /** Etiqueta del prompt: cambia mientras se compone, como haría un shell. */
  get etiquetaPrompt(): string {
    return this.borrador ? this.borrador.paso : '';
  }

  get componiendo(): boolean {
    return this.borrador !== null;
  }

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
        out('Software Engineer · Java & Full Stack. Java y Spring Boot en el backend, Angular en el frontend.'),
        out('Trabajo con infraestructura interna de inferencia de LLMs con vLLM sobre NVIDIA multi-GPU.', 'muted'),
      ),
    });

    this.register({
      name: 'ls',
      args: NOTAS_PUBLICADAS ? '[proyectos|notas]' : '[proyectos]',
      help: NOTAS_PUBLICADAS ? 'listar proyectos o notas' : 'listar proyectos',
      run: (args) => {
        const que = (args[0] ?? 'proyectos').replace(/^~\//, '');
        if (NOTAS_PUBLICADAS && que.startsWith('nota')) {
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
      help: NOTAS_PUBLICADAS ? 'leer una nota o un proyecto' : 'leer un proyecto',
      run: (args) => {
        const termino = args[0];
        if (!termino) return only(out('uso: cat <archivo>', 'warn'));

        const nota = NOTAS_PUBLICADAS ? buscarNota(termino) : undefined;
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
      name: 'mail',
      help: 'escribirme sin salir de aquí',
      run: () => {
        this.borrador = { paso: 'nombre', nombre: '', email: '', mensaje: '' };
        return only(
          out('componiendo un mensaje · :cancelar para salir', 'muted'),
          out(PREGUNTA.nombre),
        );
      },
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
    if (this.borrador) return this.componer(linea);

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

  /** Un paso del formulario. Valida antes de avanzar para no gastar una
   *  petición en algo que el Worker va a rechazar igualmente. */
  private componer(linea: string): ShellResult {
    const b = this.borrador!;

    if (linea === ':cancelar') {
      this.borrador = null;
      return only(out('mensaje descartado', 'muted'));
    }

    if (b.paso === 'confirmar') {
      if (/^(s|si|sí|y|yes)$/i.test(linea)) {
        const { nombre, email, mensaje } = b;
        this.borrador = null;
        return { lines: [out('enviando…', 'muted')], enviar: { nombre, email, mensaje } };
      }
      this.borrador = null;
      return only(out('mensaje descartado', 'muted'));
    }

    const campo = b.paso;
    const { min, max } = LIMITES[campo];
    if (linea.length < min) return only(out(`demasiado corto, mínimo ${min} caracteres`, 'warn'));
    if (linea.length > max) return only(out(`demasiado largo, máximo ${max} caracteres`, 'warn'));
    if (campo === 'email' && !EMAIL.test(linea)) {
      return only(out('eso no parece un correo', 'warn'));
    }

    b[campo] = campo === 'email' ? linea.toLowerCase() : linea;
    b.paso = campo === 'nombre' ? 'email' : campo === 'email' ? 'mensaje' : 'confirmar';

    if (b.paso !== 'confirmar') return only(out(PREGUNTA[b.paso]));

    return only(
      out(b.nombre, 'text', '  de'),
      out(b.email, 'text', '  correo'),
      out(b.mensaje, 'text', '  mensaje'),
      out(PREGUNTA.confirmar),
    );
  }

  /** Autocompletado con Tab: comandos, y argumentos de `cat` y `cd`. */
  complete(input: string): readonly string[] {
    if (this.borrador) return [];
    const partes = input.split(/\s+/);
    if (partes.length <= 1) {
      const p = (partes[0] ?? '').toLowerCase();
      return this.names.filter((n) => n.startsWith(p));
    }
    const cmd = partes[0].toLowerCase();
    const arg = partes[partes.length - 1].toLowerCase();
    if (cmd === 'cat') {
      return [
        ...(NOTAS_PUBLICADAS ? NOTAS.map((n) => `${n.slug}.md`) : []),
        ...PROYECTOS.map((p) => p.archivo),
      ].filter((c) => c.startsWith(arg));
    }
    if (cmd === 'cd' || cmd === 'ws') {
      return Object.keys(ESPACIOS).filter((k) => k.length > 1 && k.startsWith(arg));
    }
    return [];
  }
}
