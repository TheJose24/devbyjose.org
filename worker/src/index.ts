import { EmailMessage } from 'cloudflare:email';
import { construirMensaje } from './mensaje';
import { validar } from './validar';

interface Limitador {
  limit(o: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  readonly CORREO: { send(m: EmailMessage): Promise<void> };
  /**
   * Dos ventanas sobre la misma IP. El contador de Cloudflare es aproximado y
   * de consistencia diferida: medido contra el Worker desplegado, una ráfaga
   * de ocho peticiones en dos segundos pasó entera con una sola ventana de
   * 5/60s, y solo empezó a bloquear alrededor de la undécima. La ventana corta
   * corta la ráfaga; la larga corta el goteo sostenido.
   */
  readonly RAFAGA?: Limitador;
  readonly SOSTENIDO?: Limitador;
  /**
   * Orígenes que pueden llamar, separados por comas. Son varios porque el
   * sitio responde en el dominio raíz y en www: si solo se acepta uno, el
   * formulario falla desde el otro y el navegador no explica por qué.
   * El primero es el canónico y el que se devuelve cuando no hay `Origin`.
   */
  readonly ORIGENES_PERMITIDOS: string;
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
    const permitidos = env.ORIGENES_PERMITIDOS.split(',').map((o) => o.trim()).filter(Boolean);
    const solicitante = req.headers.get('origin');
    // Se devuelve el origen que pidió, no una constante: con varios dominios,
    // responder siempre el mismo hace que el navegador rechace los demás.
    const permitido = !!solicitante && permitidos.includes(solicitante);
    const origen = permitido ? solicitante : permitidos[0];

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
    if (solicitante && !permitido) {
      return json({ ok: false, motivo: 'origen' }, 403, origen);
    }

    // Los limitadores van antes de leer y validar el cuerpo: si van después,
    // quien machaque con peticiones inválidas nunca los toca y sale gratis.
    const ip = req.headers.get('cf-connecting-ip') ?? 'desconocida';
    for (const limitador of [env.RAFAGA, env.SOSTENIDO]) {
      if (!limitador) continue;
      const { success } = await limitador.limit({ key: ip });
      if (!success) return json({ ok: false, motivo: 'demasiadas-peticiones' }, 429, origen);
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

    let crudo: string;
    try {
      crudo = construirMensaje({ ...v.datos, remitente: env.REMITENTE, destino: env.DESTINO });
    } catch (e) {
      // Componer el MIME puede lanzar por una cabecera mal formada. Sin este
      // try la excepción salía sin capturar y Cloudflare devolvía su propia
      // página de error en vez de nuestro JSON.
      console.error('fallo al componer el correo', e);
      return json({ ok: false, motivo: 'envio' }, 502, origen);
    }

    try {
      await env.CORREO.send(new EmailMessage(env.REMITENTE, env.DESTINO, crudo));
    } catch (e) {
      console.error('fallo al enviar', e);
      return json({ ok: false, motivo: 'envio' }, 502, origen);
    }

    return json({ ok: true }, 200, origen);
  },
};
