/**
 * El Worker se publica en la misma ruta del dominio (`/api/*`), así que la
 * petición sale del mismo origen y no hay CORS de por medio. La ruta es
 * relativa a propósito: el sitio responde tanto en el dominio raíz como en
 * www, y una URL absoluta obligaría a elegir uno.
 */
export const ENDPOINT_CONTACTO = '/api/contacto';
