import { describe, expect, it } from 'vitest';
import { construirMensaje } from '../src/mensaje';

/**
 * Las cabeceras con acentos o signos viajan en «encoded-word» de RFC 2047,
 * así que comparar contra el texto plano no vale de nada.
 */
function descifrar(linea: string): string {
  return linea.replace(/=\?utf-8\?B\?(.+?)\?=/gi, (_, b64) =>
    Buffer.from(b64, 'base64').toString('utf8'),
  );
}

/** Solo las cabeceras: el cuerpo empieza tras la primera línea en blanco. */
const cabeceras = (crudo: string) => crudo.split(/\r?\n\r?\n/)[0];
const cabecera = (crudo: string, nombre: string) =>
  descifrar(cabeceras(crudo).split(/\r?\n/).find((l) => l.startsWith(`${nombre}: `)) ?? '');

const base = {
  nombre: 'Ana Torres',
  email: 'ana@empresa.com',
  mensaje: 'Vimos tu portafolio y queremos hablar de una vacante backend.',
  remitente: 'formulario@devbyjose.org',
  destino: 'devbyjose@gmail.com',
};

describe('construirMensaje', () => {
  it('compone un correo válido', () => {
    // Este caso solo pasa si mimetext acepta todas las cabeceras. La versión
    // anterior pasaba Reply-To como «Nombre <correo>» y lanzaba
    // MIMETEXT_INVALID_HEADER_VALUE, pero solo al enviar de verdad: el
    // despliegue salía bien y el formulario devolvía un 500 sin explicación.
    const crudo = construirMensaje(base);
    expect(crudo).toContain('From: ');
    expect(crudo).toContain('To: ');
    expect(crudo).toContain('Reply-To: ');
    expect(crudo).toContain('Subject: ');
  });

  it('el remitente es el buzón del dominio propio, no el visitante', () => {
    const from = cabecera(construirMensaje(base), 'From');
    expect(from).toContain(base.remitente);
    expect(from).not.toContain(base.email);
  });

  it('responder escribe a quien rellenó el formulario', () => {
    const replyTo = cabecera(construirMensaje(base), 'Reply-To');
    expect(replyTo).toContain(base.email);
    expect(replyTo).toContain('Ana Torres');
  });

  it('el asunto lleva el nombre', () => {
    expect(cabecera(construirMensaje(base), 'Subject')).toContain('Contacto web · Ana Torres');
  });

  it('el cuerpo conserva el mensaje y los datos de contacto', () => {
    const crudo = construirMensaje(base);
    expect(crudo).toContain(base.mensaje);
    expect(crudo).toContain(base.email);
  });

  it('un salto de linea en el nombre no inyecta cabeceras', () => {
    // Sin limpiar, «Ana\nBcc: otro@sitio» añadiría un destinatario oculto.
    const crudo = construirMensaje({ ...base, nombre: 'Ana\nBcc: otro@sitio.example' });
    expect(cabeceras(crudo)).not.toMatch(/^Bcc:/m);
    expect(cabecera(crudo, 'Reply-To')).toContain(base.email);
  });

  it('el cuerpo tampoco simula cabeceras', () => {
    // No es un fallo de seguridad —el cuerpo va tras la línea en blanco— pero
    // deja un correo con aspecto de tener encabezados que nadie escribió.
    const crudo = construirMensaje({ ...base, nombre: 'Ana\nBcc: otro@sitio.example' });
    const cuerpo = crudo.split(/\r?\n\r?\n/).slice(1).join('\n\n');
    expect(cuerpo).not.toMatch(/^Bcc:/m);
  });

  it('aguanta acentos y eñes en el nombre', () => {
    const replyTo = cabecera(construirMensaje({ ...base, nombre: 'José Muñoz Peña' }), 'Reply-To');
    expect(replyTo).toContain('José Muñoz Peña');
    expect(replyTo).toContain(base.email);
  });

  it('un nombre con comillas o comas no rompe la cabecera', () => {
    // Son los caracteres que separan campos en una lista de buzones.
    for (const nombre of ['Ana "La Jefa" Torres', 'Torres, Ana']) {
      const replyTo = cabecera(construirMensaje({ ...base, nombre }), 'Reply-To');
      expect(replyTo).toContain(base.email);
    }
  });
});
