# devbyjose.org

Mi portafolio, construido como un gestor de ventanas en mosaico dentro del
navegador: cuatro espacios de trabajo, paneles que se recorren con el teclado y
un intérprete de comandos que hace de navegación.

Angular 22 sin zonas, prerenderizado a HTML estático y desplegado en Cloudflare
Pages. El formulario de contacto vive en un Worker aparte.

## Por qué está hecho así

**Sin zone.js.** Todo el estado son señales, así que el bundle no carga el
parcheo de APIs del navegador que Angular arrastraba históricamente.

**Estático de verdad.** Las rutas públicas se prerenderizan en el build. No hay
servidor que mantener y el sitio no depende de que nada mío esté encendido.

**El homelab no siempre está encendido**, por eso el sitio publica una vista
arquitectónica generalizada en lugar de depender de datos operativos en vivo. Muestra
las tecnologías y el modelo operativo sin exponer capacidades, identificadores
ni la lista interna de servicios.

**Las notas se compilan en el build.** `tools/build-notes.mjs` lee el Markdown
de `content/notas/`, resuelve el frontmatter y colorea el código con Shiki, de
modo que no viaja al navegador ni un byte de resaltado de sintaxis.

## Estructura

| Ruta | Qué hay |
| --- | --- |
| `src/app/core/` | Estado del gestor de ventanas, intérprete de comandos y metadatos sociales |
| `src/app/workspaces/` | Los cuatro espacios: inicio, proyectos, homelab y notas |
| `src/app/ui/` | Paneles y contexto de la vista pública |
| `src/app/data/` | Contenido tipado: perfil, topología, proyectos |
| `content/notas/` | Las notas en Markdown, fuente del pipeline |
| `tools/` | Compilador de notas y verificaciones del build |
| `public/fonts/` | JetBrains Mono servida desde el propio dominio |
| `worker/` | Worker del formulario de contacto, con su propio despliegue |

## Desarrollo

```bash
pnpm install
pnpm start          # http://localhost:4200
pnpm test           # suite Angular
pnpm --dir worker test  # suite del Worker
pnpm build          # prerenderiza a dist/portafolio/browser
```

La ejecución actual recoge **111 casos: 97 aprobados y 14 omitidos**. Son dos
casos menos que la auditoría anterior porque se retiraron las pruebas del helper
de antigüedad que dejó de usarse al eliminar el estado en vivo del homelab. Los
omitidos pertenecen a pruebas de la sección de notas que se ejecutan solo cuando
existe al menos una nota publicada; actualmente todas están marcadas como
borrador y el compilador las excluye del bundle.

`pretest` compila las notas y ejecuta dos comprobaciones:

- **`check-limites.mjs`** compara las reglas de validación del formulario entre
  el cliente y el Worker. Son paquetes distintos y no pueden compartir módulo,
  así que esto evita que se separen sin que nadie se entere.
- **`check-fuentes.mjs`** exige que las fuentes se sirvan desde el propio
  dominio. Un `@import` a Google Fonts no molesta en desarrollo —Angular lo
  incrusta al compilar— pero el día que Google no responde revienta el build y
  el despliegue se cae por algo ajeno al proyecto.
- **`check-node.mjs`** compara `engines.node` y `.node-version` con la versión
  que exige el CLI de Angular. Escribir el rango a mano ya provocó un
  despliegue fallido: decía `>=22.0.0`, Cloudflare eligió 22.16.0 y Angular
  pedía 22.22.3. Este también corre en `prebuild`, así que falla en el primer
  segundo del build y no a mitad.

La versión de Node del despliegue se fija en `.node-version`, no en una
variable de entorno del panel: así viaja con el repositorio y se revisa en el
mismo commit que el código.

## Despliegue

El sitio va a Cloudflare Pages desde `master`:

| Campo | Valor |
| --- | --- |
| Build command | `pnpm build` |
| Output directory | `dist/portafolio/browser` |

El Worker se despliega aparte y atiende en `https://www.devbyjose.org/api/*`. Sus
instrucciones están en [`worker/README.md`](worker/README.md).

## Ramas

`master` solo recibe releases. El trabajo se integra en `develop` y sale por
ramas `feature/*` y `fix/*`, que se fusionan con `--no-ff` para conservar la
historia de cada cambio.
