import { EmailMessage } from 'cloudflare:email';
import { createMimeMessage } from 'mimetext/browser';
import { limpiarCabecera, validar } from './validar';

export interface Env {
  readonly CORREO: { send(m: EmailMessage): Promise<void> };
  readonly LIMITE?: { limit(o: { key: string }): Promise<{ success: boolean }> };
  readonly ORIGEN_PERMITIDO: string;
  /** Buzón que recibe los avisos del formulario. Verificado en Email Routing. */
  readonly DESTINO: string;
  /**
   * Remitente. El binding `send_email` exige que el `from` pertenezca a un
   * dominio de la cuenta con Email Routing activo: poner aquí un gmail hace
   * que Cloudflare rechace el envío.
   */
  readonly REMITENTE: string;
}

const json = (cuerpo: unknown, estado: number, origen: string): Response =>
  new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': origen,
      'vary': 'origin',
    },
  });

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origen = env.ORIGEN_PERMITIDO;

    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': origen,
          'access-control-allow-methods': 'POST, OPTIONS',
          'access-control-allow-headers': 'content-type',
          'access-control-max-age': '86400',
        },
      });
    }

    if (req.method !== 'POST') return json({ ok: false, motivo: 'metodo' }, 405, origen);

    const url = new URL(req.url);
    if (url.pathname !== '/api/contacto') return json({ ok: false, motivo: 'ruta' }, 404, origen);

    // El navegador ya bloquea el origen ajeno por CORS, pero eso no protege de
    // una petición hecha fuera del navegador; se comprueba también aquí.
    const enviadoDesde = req.headers.get('origin');
    if (enviadoDesde && enviadoDesde !== origen) {
      return json({ ok: false, motivo: 'origen' }, 403, origen);
    }

    let cuerpo: unknown;
    try {
      cuerpo = await req.json();
    } catch {
      return json({ ok: false, motivo: 'json-invalido' }, 400, origen);
    }

    const v = validar(cuerpo);
    if (!v.ok) {
      // Al bot se le responde éxito: si ve un error, aprende a esquivar la trampa.
      if (v.motivo === 'trampa') return json({ ok: true }, 202, origen);
      return json({ ok: false, motivo: v.motivo, campo: v.campo }, 422, origen);
    }

    if (env.LIMITE) {
      const ip = req.headers.get('cf-connecting-ip') ?? 'desconocida';
      const { success } = await env.LIMITE.limit({ key: ip });
      if (!success) return json({ ok: false, motivo: 'demasiadas-peticiones' }, 429, origen);
    }

    const { nombre, email, mensaje } = v.datos;
    const mime = createMimeMessage();
    mime.setSender({ name: 'formulario devbyjose.org', addr: env.REMITENTE });
    mime.setRecipient(env.DESTINO);
    // Responder al correo escribe a quien rellenó el formulario, no a uno mismo.
    mime.setHeader('Reply-To', `${limpiarCabecera(nombre)} <${limpiarCabecera(email)}>`);
    mime.setSubject(`Contacto web · ${limpiarCabecera(nombre)}`);
    mime.addMessage({
      contentType: 'text/plain',
      data: `De: ${nombre} <${email}>\n\n${mensaje}\n`,
    });

    try {
      await env.CORREO.send(new EmailMessage(env.REMITENTE, env.DESTINO, mime.asRaw()));
    } catch (e) {
      console.error('fallo al enviar', e);
      return json({ ok: false, motivo: 'envio' }, 502, origen);
    }

    return json({ ok: true }, 200, origen);
  },
};
