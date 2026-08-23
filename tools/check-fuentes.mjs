/**
 * Verifica que las fuentes se sirvan desde el propio dominio.
 *
 * Un `@import` a fonts.googleapis.com no falla en desarrollo: Angular lo
 * resuelve en tiempo de compilación y lo incrusta. El problema aparece el día
 * que Google no responde, porque entonces revienta el build entero y el
 * despliegue se cae por algo que no es tuyo. Ya pasó una vez.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const errores = [];
const leer = (p) => readFileSync(p, 'utf8');

/** Los comentarios no piden nada por red: mencionar un dominio en prosa vale. */
const sinComentarios = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

// 1. Nada del exterior en las hojas de estilo.
const HOJAS = ['src/styles.css', 'src/fuentes.css'];
for (const hoja of HOJAS) {
  const css = sinComentarios(leer(hoja));
  for (const dominio of ['fonts.googleapis.com', 'fonts.gstatic.com']) {
    if (css.includes(dominio)) {
      errores.push(`${hoja} referencia ${dominio}: el build dependería de un tercero`);
    }
  }
  const externos = css.match(/@import\s+url\(\s*["']?https?:/g);
  if (externos) errores.push(`${hoja} tiene ${externos.length} @import remoto`);
}

// 2. Cada fuente declarada existe en disco.
const fuentes = leer('src/fuentes.css');
const referidas = [...fuentes.matchAll(/url\(['"]?\/fonts\/([^'")]+)['"]?\)/g)].map((m) => m[1]);
if (referidas.length === 0) errores.push('src/fuentes.css no declara ninguna fuente local');

for (const archivo of referidas) {
  if (!existsSync(join('public/fonts', archivo))) {
    errores.push(`src/fuentes.css apunta a /fonts/${archivo}, que no está en public/fonts/`);
  }
}

// 3. Nada sobrante: un .woff2 que ya no usa nadie son kilobytes muertos.
const enDisco = existsSync('public/fonts') ? readdirSync('public/fonts') : [];
for (const archivo of enDisco) {
  if (archivo.endsWith('.woff2') && !referidas.includes(archivo)) {
    errores.push(`public/fonts/${archivo} no lo declara ninguna regla @font-face`);
  }
}

// 4. El preload tiene que apuntar a algo que exista.
const html = leer('src/index.html');
for (const [, ruta] of html.matchAll(/rel="preload"[^>]*href="\/fonts\/([^"]+)"/gs)) {
  if (!referidas.includes(ruta)) {
    errores.push(`index.html precarga /fonts/${ruta}, que no declara ninguna @font-face`);
  }
}

if (errores.length) {
  console.error('fuentes: revisar\n' + errores.map((e) => `  · ${e}`).join('\n'));
  process.exit(1);
}
console.log(`fuentes: ${referidas.length} archivos propios, ninguna petición a terceros`);
