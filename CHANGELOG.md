# Registro de cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Sin publicar]

### Cambiado

- La presentación profesional se alinea con la fuente maestra y limita los
  detalles de experiencia, proyectos e infraestructura a claims publicables.
- La vista del homelab pasa a ser una descripción arquitectónica generalizada,
  sin capacidades, identificadores, inventario interno ni datos operativos.
- La tarjeta social del homelab reutiliza la imagen general del sitio.

## [1.6.0] — 2026-08-23

### Cambiado

- El espacio de notas queda oculto mientras el contenido siga en borrador. Sin
  pestaña, sin rutas, sin comandos y sin tarjeta de enlace: `/notas` redirige
  al inicio. Lo gobierna `NOTAS_PUBLICADAS` en `core/wm.ts`.

### Corregido

- El compilador de notas emitía los borradores. Ocultarlos en la interfaz no
  bastaba: el JSON entraba en el bundle y el texto completo viajaba al
  navegador de cualquiera que abriese el `.js`. Ahora se filtran en el origen.
- Una prueba del listado de notas pulsaba la segunda fila y fallaba por índice
  en cuanto se publicaba una sola nota.

## [1.5.0] — 2026-08-23

### Añadido

- Tarjeta de enlace propia por ruta. Antes todas las páginas compartían las
  etiquetas Open Graph del índice, así que compartir `/homelab` mostraba la
  tarjeta genérica del sitio.
- Una tarjeta de enlace específica para la vista del homelab.

### Corregido

- La presentación del homelab contenía software y versiones que no describían
  correctamente su estado.
- Euphony figuraba solo como proyecto de 2024; se incorporó una etapa posterior
  de modernización.
- El ingreso a Qallpa TIC era marzo de 2025, no noviembre de 2024, y la
  experiencia declarada pasa de «cerca de 2 años» a «año y medio».

## [1.4.1] — 2026-08-23

### Corregido

- El CV publicado en `/cv.pdf` enlazaba a `devbyjose.org`, que no tiene
  registro DNS. Ahora apunta a `www.devbyjose.org`.

## [1.4.0] — 2026-08-23

### Corregido

- El limitador de peticiones dejaba pasar las ráfagas. Medido contra el Worker
  desplegado: con una sola ventana de 5/60 s, ocho peticiones en dos segundos
  pasaron enteras y el bloqueo no apareció hasta la undécima. El contador de
  Cloudflare es aproximado y de consistencia diferida, así que una ventana de
  un minuto no llega a ver la ráfaga.
- Los limitadores se comprueban antes de leer y validar el cuerpo. Estaban
  después, de modo que machacar con JSON inválido salía gratis.

### Cambiado

- Dos ventanas sobre la misma IP en lugar de una: 3 cada 10 s corta la ráfaga,
  5 cada 60 s corta el goteo sostenido. Cada una con su propio espacio de
  nombres, o contarían sobre el mismo contador.

Sigue siendo un badén y no una barrera: el contador de Cloudflare es
aproximado por diseño.

## [1.3.1] — 2026-08-23

### Corregido

- El formulario devolvía 500 al enviar. `mimetext` valida `Reply-To` con
  `instanceof Mailbox` y rechazaba la cadena `"Nombre <correo>"`. Lanzaba fuera
  del `try` que envolvía el envío, así que la excepción salía sin capturar y
  Cloudflare respondía con su propia página de error. El despliegue no fallaba:
  solo fallaba al enviar de verdad.
- Componer el mensaje ocurre dentro de un `try`: una cabecera inválida devuelve
  502 con el JSON del Worker, no una página ajena.
- El cuerpo del correo usa el nombre ya saneado. No era un fallo de seguridad
  —el cuerpo empieza tras la línea en blanco— pero un salto de línea dejaba el
  correo con aspecto de tener encabezados que nadie escribió.

### Añadido

- `src/mensaje.ts` separa la construcción del MIME del manejador, para poder
  probarla sin `cloudflare:email`. Nueve pruebas cubren remitente, dirección de
  respuesta, asunto, acentos, comillas y saltos de línea; las nueve fallan con
  el código anterior.

## [1.3.0] — 2026-08-23

### Cambiado

- `www.devbyjose.org` es el nombre canónico. Las etiquetas Open Graph apuntaban
  al dominio raíz, que no tiene registro DNS: la tarjeta de enlace se habría
  quedado sin imagen.
- El Worker atiende y acepta solo `www`. Una ruta hacia un host que no resuelve
  no llega a atender nada.
- Las pruebas de configuración distinguen el host de la zona. El sitio vive en
  `www.devbyjose.org` mientras que el remitente del correo y las rutas cuelgan
  de `devbyjose.org`.

## [1.2.0] — 2026-08-23

### Añadido

- La topología distinguía los ámbitos de publicación web del homelab.

### Cambiado

- El Worker acepta el dominio raíz y `www`. Devolvía siempre un origen fijo en
  la cabecera de CORS, así que desde el otro nombre el navegador habría
  rechazado el formulario sin dar un motivo legible. Ahora responde con el
  origen que hizo la petición, si está en la lista, y hay una ruta declarada
  por cada host: una ruta casa con el nombre exacto y sin la de `www` las
  peticiones caían en 404.
- `ORIGEN_PERMITIDO` pasa a ser `ORIGENES_PERMITIDOS`, separados por comas. El
  primero es el canónico.

## [1.1.1] — 2026-08-23

### Corregido

- El despliegue en Cloudflare Pages fallaba. `engines.node` declaraba
  `>=22.0.0`, Cloudflare eligió 22.16.0 —que cumple ese rango— y el CLI de
  Angular la rechazó porque exige `^22.22.3`. Ahora el rango se copia literal
  del CLI y `.node-version` fija 24.16.0.

### Añadido

- `tools/check-node.mjs`, en `prebuild` y en `pretest`: compara el rango
  declarado y la versión fijada con la que exige Angular, para que la
  discrepancia salte en local y no veinte segundos dentro del build remoto.

## [1.1.0] — 2026-08-23

### Añadido

- Favicon propio: el prompt de terminal del sitio, en `.svg` y en `.ico` con
  16, 32 y 48 px renderizados por separado. Antes era el de una aplicación
  Angular recién generada.
- `apple-touch-icon.png` de 180 px con fondo opaco, que es lo que iOS espera.
- `og.png` de 1200×630 y etiquetas Open Graph: compartir el enlace ya no
  muestra una tarjeta vacía.
- `description`, `author` y `theme-color`.

### Corregido

- La instalación de dependencias no era reproducible. No había lockfile y pnpm
  resolvía contra un `pnpm-workspace.yaml` del directorio personal del usuario,
  que en el build de Cloudflare Pages no existe. Ahora cada paquete es su
  propia raíz, con lockfile propio, y `packageManager` y `engines` fijan las
  versiones de pnpm y de Node.

## [1.0.2] — 2026-08-23

### Quitado

- `CLAUDE.md` y `.mcp.json` salen del repositorio de verdad. En 1.0.1 se
  anunciaron como eliminados pero siguieron rastreados: las reglas del
  `.gitignore` no se aplican a archivos que git ya conoce.

## [1.0.1] — 2026-08-23

### Cambiado

- JetBrains Mono se sirve desde el propio dominio. El `@import` a Google Fonts
  lo resolvía Angular en tiempo de compilación, así que un fallo de Google
  tumbaba el build entero y con él el despliegue. Solo se incluyen los
  subconjuntos `latin` y `latin-ext`: 136 kB frente a los seis rangos que
  servía Google.
- El documento declara `lang="es"`. Estaba en `en`, lo que hace que un lector
  de pantalla pronuncie mal todo el sitio.

### Añadido

- `tools/check-fuentes.mjs`, enganchado a `pretest`: impide volver a depender de
  un tercero para las fuentes y avisa de archivos referidos que falten o de
  `.woff2` que ya no use ninguna regla.
- Precarga del peso normal de la fuente en `index.html`.

### Quitado

- `CLAUDE.md` y `.mcp.json` dejan de rastrearse. Siguen en disco.

## [1.0.0] — 2026-08-23

Primera versión pública.

### Añadido

- Gestor de ventanas en mosaico con cuatro espacios de trabajo: inicio,
  proyectos, homelab y notas. Se recorren con teclado y la URL es la única
  fuente de verdad del espacio activo.
- Intérprete de comandos con autocompletado por tabulador, historial y
  navegación entre espacios.
- Comando `mail`: compone y envía un mensaje contra el Worker de contacto, con
  las mismas reglas de validación que aplica el servidor.
- Panel de homelab con una vista de arquitectura y estado operativo.
- Notas técnicas en Markdown compiladas en el build, con resaltado de sintaxis
  resuelto por Shiki en tiempo de compilación.
- Versión móvil en modo monóculo: un panel a la vez, con gestos de deslizamiento.
- Worker de contacto en Cloudflare con envío nativo por `send_email`, limitador
  de peticiones por IP y campo trampa contra bots.
- `tools/check-limites.mjs`: verifica que las reglas de validación del cliente y
  del Worker no se separen.

### Detalles

- Angular 22 sin zonas. El estado son señales y el bundle no incluye `zone.js`.
- Las rutas públicas se prerenderizan; el sitio no necesita servidor.
- Pruebas automatizadas para el sitio y el Worker.
