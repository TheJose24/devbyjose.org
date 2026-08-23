# devbyjose.org

Mi portafolio, construido como un gestor de ventanas en mosaico dentro del
navegador: cuatro espacios de trabajo, paneles que se recorren con el teclado y
un intérprete de comandos que hace de navegación.

Angular 22 sin zonas, prerenderizado a HTML estático y desplegado en Cloudflare
Pages. El formulario de contacto vive en un Worker aparte.

## Por qué está hecho así

**Sin zone.js.** Todo el estado son señales, así que el bundle no carga el
parcheo de APIs del navegador que Angular arrastraba históricamente.

**Estático de verdad.** Las 8 rutas se prerenderizan en el build. No hay
servidor que mantener y el sitio no depende de que nada mío esté encendido.

**El homelab no siempre está encendido**, y el sitio tiene que aguantarlo. Las
métricas siguen una cadena de tres pasos —API en vivo, caché del navegador,
snapshot del build— y en todos los casos se muestra la antigüedad del dato. La
página nunca queda en blanco ni finge estar al día.

**Las notas se compilan en el build.** `tools/build-notes.mjs` lee el Markdown
de `content/notas/`, resuelve el frontmatter y colorea el código con Shiki, de
modo que no viaja al navegador ni un byte de resaltado de sintaxis.

## Estructura

| Ruta | Qué hay |
| --- | --- |
| `src/app/core/` | Estado del gestor de ventanas, intérprete de comandos y cliente de métricas |
| `src/app/workspaces/` | Los cuatro espacios: inicio, proyectos, homelab y notas |
| `src/app/ui/` | Panel y distintivo de antigüedad del dato |
| `src/app/data/` | Contenido tipado: perfil, topología, proyectos |
| `content/notas/` | Las notas en Markdown, fuente del pipeline |
| `tools/` | Compilador de notas y verificaciones del build |
| `public/fonts/` | JetBrains Mono servida desde el propio dominio |
| `worker/` | Worker del formulario de contacto, con su propio despliegue |

## Desarrollo

```bash
pnpm install
pnpm start          # http://localhost:4200
pnpm test           # 66 pruebas
pnpm build          # prerenderiza a dist/portafolio/browser
```

`pretest` compila las notas y ejecuta dos comprobaciones:

- **`check-limites.mjs`** compara las reglas de validación del formulario entre
  el cliente y el Worker. Son paquetes distintos y no pueden compartir módulo,
  así que esto evita que se separen sin que nadie se entere.
- **`check-fuentes.mjs`** exige que las fuentes se sirvan desde el propio
  dominio. Un `@import` a Google Fonts no molesta en desarrollo —Angular lo
  incrusta al compilar— pero el día que Google no responde revienta el build y
  el despliegue se cae por algo ajeno al proyecto.

## Despliegue

El sitio va a Cloudflare Pages desde `master`:

| Campo | Valor |
| --- | --- |
| Build command | `pnpm build` |
| Output directory | `dist/portafolio/browser` |

El Worker se despliega aparte y atiende en `devbyjose.org/api/*`. Sus
instrucciones están en [`worker/README.md`](worker/README.md).

## Ramas

`master` solo recibe releases. El trabajo se integra en `develop` y sale por
ramas `feature/*` y `fix/*`, que se fusionan con `--no-ff` para conservar la
historia de cada cambio.
