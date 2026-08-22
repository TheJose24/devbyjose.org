/**
 * Compila content/notas/*.md a HTML durante el build.
 *
 * Salida:
 *   src/app/data/notas.json   metadatos, para el listado y las rutas prerenderizadas
 *   public/notas/<slug>.html  cuerpo ya renderizado, con el código resaltado
 *
 * Resaltar con shiki aquí y no en el navegador significa cero JavaScript de
 * resaltado enviado al cliente, y código legible aunque el usuario no tenga JS.
 */
import { readFile, readdir, writeFile, mkdir, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import { createHighlighter } from 'shiki';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'content', 'notas');
const OUT_HTML = join(ROOT, 'public', 'notas');
const OUT_JSON = join(ROOT, 'src', 'app', 'data', 'notas.json');

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

await rm(OUT_HTML, { recursive: true, force: true });
await mkdir(OUT_HTML, { recursive: true });
await mkdir(dirname(OUT_JSON), { recursive: true });

const index = [];
const slugs = new Set();

for (const file of files) {
  const raw = await readFile(join(SRC, file), 'utf8');
  const { data, content } = matter(raw);

  const missing = REQUIRED.filter((k) => data[k] === undefined);
  if (missing.length) throw new Error(`${file}: falta en el frontmatter → ${missing.join(', ')}`);
  if (slugs.has(data.slug)) throw new Error(`${file}: slug duplicado → ${data.slug}`);
  slugs.add(data.slug);

  const body = md.render(content);
  await writeFile(join(OUT_HTML, `${data.slug}.html`), body, 'utf8');

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

const borradores = index.filter((n) => n.borrador).length;
console.log(
  `notas: ${index.length} compiladas → public/notas/` +
  (borradores ? `  (${borradores} en borrador)` : ''),
);
