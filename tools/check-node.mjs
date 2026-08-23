/**
 * Verifica que la versión de Node declarada cuadre con la que exige Angular.
 *
 * El despliegue de Pages ya falló una vez por esto: `engines.node` decía
 * `>=22.0.0`, Cloudflare eligió 22.16.0 —que cumple ese rango— y el CLI de
 * Angular lo rechazó porque pide 22.22.3 como mínimo. El rango escrito a mano
 * se separó del real sin que nadie lo notara hasta el build.
 */
import { readFileSync } from 'node:fs';

const errores = [];
const paquete = JSON.parse(readFileSync('package.json', 'utf8'));
const exigido = JSON.parse(
  readFileSync('node_modules/@angular/cli/package.json', 'utf8'),
).engines.node;

// 1. El rango declarado es exactamente el del CLI, no una aproximación.
const declarado = paquete.engines?.node;
if (declarado !== exigido) {
  errores.push(
    `package.json declara engines.node "${declarado}" y el CLI de Angular exige "${exigido}"`,
  );
}

/** [mayor, menor, parche] a partir de «24.16.0». */
const partes = (v) => v.trim().replace(/^v/, '').split('.').map(Number);
const mayorOIgual = (a, b) => {
  for (let i = 0; i < 3; i++) {
    if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) > (b[i] ?? 0);
  }
  return true;
};

/** Solo los operadores que Angular usa: `^x.y.z` y `>=x.y.z`. */
function cumple(version, rango) {
  return rango.split('||').some((tramo) => {
    const t = tramo.trim();
    if (t.startsWith('^')) {
      const base = partes(t.slice(1));
      return version[0] === base[0] && mayorOIgual(version, base);
    }
    if (t.startsWith('>=')) return mayorOIgual(version, partes(t.slice(2)));
    return false;
  });
}

// 2. La versión fijada para el build satisface ese rango.
let fijada;
try {
  fijada = partes(readFileSync('.node-version', 'utf8'));
} catch {
  errores.push('falta .node-version: sin él Cloudflare elige la versión que quiera');
}

if (fijada && !cumple(fijada, exigido)) {
  errores.push(`.node-version fija ${fijada.join('.')}, que no cumple "${exigido}"`);
}

// 3. El Node con el que se está trabajando también, o las pruebas mienten.
if (!cumple(partes(process.version), exigido)) {
  errores.push(`estás usando Node ${process.version}, que no cumple "${exigido}"`);
}

if (errores.length) {
  console.error('node: revisar\n' + errores.map((e) => `  · ${e}`).join('\n'));
  process.exit(1);
}
console.log(`node: ${fijada.join('.')} fijada para el build, cumple "${exigido}"`);
