/**
 * Compila content/notas/*.md a HTML durante el build.
 *
 * Salida:
 *   src/app/data/notas.json          metadatos: listado, prompt y rutas a prerenderizar
 *   src/app/data/notas-cuerpos.json  slug → html, para la ficha
 *
 * Los cuerpos van en un módulo aparte porque solo los necesita la ruta de
 * detalle, que se carga en diferido: el listado no arrastra el peso de todo el
 * texto. Y se incrustan en el bundle en vez de pedirse por red para que el
 * artículo entero quede dentro del HTML prerenderizado.
 *
 * Resaltar con shiki aquí y no en el navegador significa cero JavaScript de
 * resaltado enviado al cliente, y código legible aunque el usuario no tenga JS.
 */
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import { createHighlighter } from 'shiki';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'content', 'notas');
const OUT_JSON = join(ROOT, 'src', 'app', 'data', 'notas.json');
const OUT_CUERPOS = join(ROOT, 'src', 'app', 'data', 'notas-cuerpos.json');

const REQUIRED = ['titulo', 'slug', 'fecha', 'tags', 'resumen', 'minutos'];

const highlighter = await createHighlighter({
  themes: ['github-dark-default'],
  langs: ['bash', 'sql', 'java', 'typescript', 'json', 'yaml', 'docker'],
});

const md = new MarkdownIt({
  html: false,          // el contenido es nuestro, pero no hay razón para permitir HTML crudo
  linkify: true,
  typographer: true,
  highlight(code, lang) {
    const known = highlighter.getLoadedLanguages();
    const use = known.includes(lang) ? lang : 'bash';
    try {
      return highlighter.codeToHtml(code, { lang: use, theme: 'github-dark-default' });
    } catch {
      return '';        // markdown-it aplica su escape por defecto
    }
  },
});

const files = (await readdir(SRC)).filter((f) => f.endsWith('.md')).sort().reverse();
if (files.length === 0) throw new Error(`No hay notas en ${SRC}`);

await mkdir(dirname(OUT_JSON), { recursive: true });

const index = [];
const cuerpos = {};
const slugs = new Set();

for (const file of files) {
  const raw = await readFile(join(SRC, file), 'utf8');
  const { data, content } = matter(raw);

  const missing = REQUIRED.filter((k) => data[k] === undefined);
  if (missing.length) throw new Error(`${file}: falta en el frontmatter → ${missing.join(', ')}`);
  if (slugs.has(data.slug)) throw new Error(`${file}: slug duplicado → ${data.slug}`);
  slugs.add(data.slug);

  // Los comentarios HTML son andamiaje para escribir la nota. Con `html: false`
  // markdown-it los escaparía y acabarían visibles en la página, así que se
  // quitan antes de renderizar.
  const limpio = content.replace(/<!--[\s\S]*?-->/g, '').replace(/\n{3,}/g, '\n\n');
  cuerpos[data.slug] = md.render(limpio);

  index.push({
    slug: String(data.slug),
    titulo: String(data.titulo),
    fecha: new Date(data.fecha).toISOString().slice(0, 10),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    resumen: String(data.resumen),
    minutos: Number(data.minutos),
    borrador: data.borrador === true,
  });
}

index.sort((a, b) => b.fecha.localeCompare(a.fecha));
await writeFile(OUT_JSON, JSON.stringify(index, null, 2) + '\n', 'utf8');
await writeFile(OUT_CUERPOS, JSON.stringify(cuerpos, null, 2) + '\n', 'utf8');

const borradores = index.filter((n) => n.borrador).length;
console.log(
  `notas: ${index.length} compiladas` +
  (borradores ? `  (${borradores} en borrador)` : ''),
);
