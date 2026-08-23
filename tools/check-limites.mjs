/**
 * El cliente y el Worker validan el formulario por separado: el primero para
 * avisar sin gastar una petición, el segundo porque es la autoridad. Al vivir
 * en paquetes distintos no pueden compartir el módulo, así que este script
 * comprueba que las reglas no se hayan desincronizado.
 *
 * Corre antes de las pruebas: si alguien cambia un límite en un lado, falla.
 */
import { readFile } from 'node:fs/promises';

const FUENTES = {
  cliente: 'src/app/core/shell.ts',
  worker: 'worker/src/validar.ts',
};

function extraer(texto, ruta) {
  const bloque = texto.match(/const LIMITES = \{(.*?)\} as const;/s);
  const email = texto.match(/const EMAIL = (\/.*?\/);/);
  if (!bloque || !email) throw new Error(`${ruta}: no encuentro LIMITES o EMAIL`);
  const limites = {};
  for (const [, campo, min, max] of bloque[1].matchAll(/(\w+):\s*\{\s*min:\s*(\d+),\s*max:\s*(\d+)/g)) {
    limites[campo] = { min: Number(min), max: Number(max) };
  }
  if (Object.keys(limites).length === 0) throw new Error(`${ruta}: LIMITES vacío`);
  return { limites, email: email[1] };
}

const [cliente, worker] = await Promise.all(
  Object.values(FUENTES).map(async (r) => extraer(await readFile(r, 'utf8'), r)),
);

const problemas = [];
if (JSON.stringify(cliente.limites) !== JSON.stringify(worker.limites)) {
  problemas.push(
    `límites distintos:\n  cliente ${JSON.stringify(cliente.limites)}\n  worker  ${JSON.stringify(worker.limites)}`,
  );
}
if (cliente.email !== worker.email) {
  problemas.push(`regex de correo distinta:\n  cliente ${cliente.email}\n  worker  ${worker.email}`);
}

if (problemas.length) {
  console.error(`\nLas reglas del formulario se han desincronizado:\n`);
  for (const p of problemas) console.error(`  ${p}\n`);
  console.error(`Cuadra ${FUENTES.cliente} con ${FUENTES.worker}.\n`);
  process.exit(1);
}

console.log('reglas del formulario: cliente y worker coinciden');
