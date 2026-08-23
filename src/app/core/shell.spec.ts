import { Shell } from './shell';
import { NOTAS } from '../data/notas';

describe('Shell', () => {
  let sh: Shell;
  beforeEach(() => { sh = new Shell(); });

  it('la entrada vacía no produce nada', () => {
    expect(sh.run('')).toBeNull();
    expect(sh.run('   ')).toBeNull();
  });

  it('help enumera todos los comandos del registro', () => {
    const r = sh.run('help')!;
    for (const nombre of sh.names) {
      expect(r.lines.some((l) => l.label?.trim().startsWith(nombre))).toBe(true);
    }
  });

  it('un comando inexistente sugiere el más parecido', () => {
    const r = sh.run('clea')!;
    expect(r.lines[0].tone).toBe('warn');
    expect(r.lines[0].text).toContain('clear');
  });

  it('ws es alias de cd', () => {
    expect(sh.run('ws 3')!.goto).toBe('homelab');
    expect(sh.run('cd homelab')!.goto).toBe('homelab');
  });

  it('cd rechaza un espacio desconocido sin navegar', () => {
    const r = sh.run('cd musica')!;
    expect(r.goto).toBeUndefined();
    expect(r.lines[0].tone).toBe('warn');
  });

  it('cat encuentra una nota por slug, con o sin extensión', () => {
    const slug = NOTAS[0].slug;
    expect(sh.run(`cat ${slug}`)!.lines[0].text).toBe(NOTAS[0].titulo);
    expect(sh.run(`cat ${slug}.md`)!.lines[0].text).toBe(NOTAS[0].titulo);
  });

  it('cat avisa cuando la nota es un borrador', () => {
    const borrador = NOTAS.find((n) => n.borrador);
    if (!borrador) return;
    const r = sh.run(`cat ${borrador.slug}`)!;
    expect(r.lines.some((l) => l.tone === 'warn' && l.text.includes('borrador'))).toBe(true);
  });

  it('cat de un proyecto navega a su espacio', () => {
    const r = sh.run('cat healthyme')!;
    expect(r.goto).toBe('proyectos');
    expect(r.lines[0].text).toBe('HealthyMe');
  });

  it('cat sin argumento explica el uso', () => {
    expect(sh.run('cat')!.lines[0].text).toContain('uso:');
  });

  it('ls distingue proyectos de notas', () => {
    expect(sh.run('ls notas')!.lines.length).toBe(NOTAS.length);
    expect(sh.run('ls')!.lines[0].label).toContain('.');
    expect(sh.run('ls musica')!.lines[0].tone).toBe('warn');
  });

  it('clear vacía en vez de acumular', () => {
    const r = sh.run('clear')!;
    expect(r.clear).toBe(true);
    expect(r.lines).toEqual([]);
  });

  it('cv ofrece una descarga', () => {
    expect(sh.run('cv')!.download).toBe('/cv.pdf');
  });

  describe('mail', () => {
    function componer(sh: Shell, ...pasos: string[]) {
      return pasos.map((p) => sh.run(p));
    }

    it('encadena las preguntas y entrega el mensaje al confirmar', () => {
      sh.run('mail');
      expect(sh.componiendo).toBe(true);
      expect(sh.etiquetaPrompt).toBe('nombre');

      componer(sh, 'Ana Torres', 'ana@empresa.com');
      expect(sh.etiquetaPrompt).toBe('mensaje');

      const resumen = sh.run('Vimos tu portafolio y queremos hablar de una vacante.')!;
      expect(resumen.lines.some((l) => l.label?.includes('correo'))).toBe(true);
      expect(sh.etiquetaPrompt).toBe('confirmar');

      const envio = sh.run('si')!;
      expect(envio.enviar).toEqual({
        nombre: 'Ana Torres',
        email: 'ana@empresa.com',
        mensaje: 'Vimos tu portafolio y queremos hablar de una vacante.',
      });
      expect(sh.componiendo).toBe(false);
    });

    it('no avanza con un campo inválido', () => {
      sh.run('mail');
      const corto = sh.run('A')!;
      expect(corto.lines[0].tone).toBe('warn');
      expect(sh.etiquetaPrompt).toBe('nombre');

      sh.run('Ana Torres');
      const malCorreo = sh.run('no-es-un-correo')!;
      expect(malCorreo.lines[0].tone).toBe('warn');
      expect(sh.etiquetaPrompt).toBe('email');
    });

    it('normaliza el correo a minúsculas', () => {
      componer(sh, 'mail', 'Ana Torres', 'ANA@Empresa.com', 'Un mensaje suficientemente largo.');
      expect(sh.run('si')!.enviar?.email).toBe('ana@empresa.com');
    });

    it(':cancelar descarta en cualquier paso', () => {
      componer(sh, 'mail', 'Ana Torres');
      const r = sh.run(':cancelar')!;
      expect(r.enviar).toBeUndefined();
      expect(sh.componiendo).toBe(false);
    });

    it('responder que no también descarta', () => {
      componer(sh, 'mail', 'Ana Torres', 'ana@empresa.com', 'Un mensaje suficientemente largo.');
      const r = sh.run('no')!;
      expect(r.enviar).toBeUndefined();
      expect(sh.componiendo).toBe(false);
    });

    it('mientras se compone, la entrada no se interpreta como comando', () => {
      sh.run('mail');
      const r = sh.run('help')!;
      // 'help' mide 4 caracteres: se toma como un nombre demasiado corto, no
      // como el comando de ayuda.
      expect(r.lines.some((l) => l.label?.trim() === 'whoami')).toBe(false);
    });

    it('el autocompletado calla mientras se compone', () => {
      sh.run('mail');
      expect(sh.complete('c')).toEqual([]);
    });
  });

  describe('autocompletado', () => {
    it('completa nombres de comando por prefijo', () => {
      expect(sh.complete('c')).toEqual(expect.arrayContaining(['cat', 'cd', 'cv', 'clear', 'contacto']));
    });
    it('completa argumentos de cat con notas y proyectos', () => {
      const op = sh.complete('cat ');
      expect(op.some((o) => o.endsWith('.md'))).toBe(true);
      expect(op).toContain('healthyme.ms');
    });
    it('completa espacios en cd, sin los alias numéricos', () => {
      const op = sh.complete('cd ');
      expect(op).toContain('homelab');
      expect(op).not.toContain('1');
    });
    it('no propone nada para un comando sin argumentos', () => {
      expect(sh.complete('whoami ')).toEqual([]);
    });
  });
});
