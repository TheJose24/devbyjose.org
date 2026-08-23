import { createMimeMessage, Mailbox } from 'mimetext/browser';
import { limpiarCabecera } from './validar';

export interface DatosCorreo {
  readonly nombre: string;
  readonly email: string;
  readonly mensaje: string;
  /** Buzón del dominio propio desde el que sale el aviso. */
  readonly remitente: string;
  /** Buzón que lo recibe. */
  readonly destino: string;
}

/**
 * Construye el correo del formulario y devuelve el MIME en crudo.
 *
 * Vive aparte del manejador para poder probarlo sin `cloudflare:email`, que
 * solo existe dentro del runtime de Workers. Es la parte que más se rompe en
 * silencio: un encabezado mal formado no falla al desplegar, falla al enviar.
 */
export function construirMensaje(d: DatosCorreo): string {
  const nombre = limpiarCabecera(d.nombre);
  const email = limpiarCabecera(d.email);

  const mime = createMimeMessage();
  mime.setSender({ name: 'formulario devbyjose.org', addr: d.remitente });
  mime.setRecipient(d.destino);
  // Responder al correo escribe a quien rellenó el formulario, no a uno mismo.
  // Tiene que ser una instancia de Mailbox: mimetext valida esta cabecera con
  // `instanceof`, así que ni la cadena «Nombre <correo>» ni un objeto plano
  // pasan. Y la validación solo salta al componer, nunca al desplegar.
  mime.setHeader('Reply-To', new Mailbox({ addr: email, name: nombre }));
  mime.setSubject(`Contacto web · ${nombre}`);
  // También en el cuerpo va el nombre limpio: un salto de línea aquí no puede
  // inyectar cabeceras —el cuerpo empieza después de la línea en blanco— pero
  // deja el correo con pinta de tener encabezados donde no los hay.
  mime.addMessage({
    contentType: 'text/plain',
    data: `De: ${nombre} <${email}>\n\n${d.mensaje}\n`,
  });

  return mime.asRaw();
}
