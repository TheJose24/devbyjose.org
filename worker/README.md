# Worker de contacto

Recibe el formulario del portafolio y lo reenvía por correo. Vive aparte del
sitio a propósito: el portafolio es estático en Cloudflare Pages y no puede
depender del homelab, que no siempre está encendido.

## Por qué el binding `send_email` y no un servicio externo

MailChannels cerró su integración gratuita con Workers en 2024. El binding
nativo `send_email` de Cloudflare envía a **direcciones verificadas en Email
Routing**, lo cual bastaría para casos como este donde el correo va siempre a la
misma dirección. Sin claves de API ni terceros.

**Requisito:** verificar `devbyjose@gmail.com` como destino en Email Routing del
dominio antes del primer despliegue, o el envío falla.

## Defensas

| | |
| --- | --- |
| Campo trampa | Un `web` invisible en el formulario. Si viene relleno se responde **éxito**, no error: si el bot ve un fallo, aprende a esquivarlo. |
| Validación | Longitudes mínimas y máximas por campo, y un correo que rechaza lo evidente sin excluir direcciones raras. |
| Límite de tasa | Binding nativo, 5 por minuto e IP. Es opcional en el código: si el binding no está, el Worker sigue funcionando. |
| Origen | CORS más comprobación del `Origin` en el servidor, porque CORS solo protege dentro del navegador. |
| Inyección de cabeceras | Los saltos de línea se eliminan de todo lo que va en una cabecera. |

## Despliegue

```bash
pnpm install
pnpm dev              # local
pnpm test             # pruebas de validación
pnpm deploy           # a Cloudflare
```

Tras desplegar, apuntar el sitio a la ruta del Worker (`/api/contacto`).
