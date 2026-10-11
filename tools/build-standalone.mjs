import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => readFile(resolve(root, relative), 'utf8');

const stripExports = source => source.replace(/\bexport\s+(?=(?:const|let|class|function)\b)/g, '');
const stripImports = source => source.replace(/import\s+[\s\S]*?\s+from\s+['"][^'"]+['"];\s*/g, '');

const [html, css, catalogue, activities, model, app] = await Promise.all([
  read('index.html'),
  read('app.css'),
  read('data/catalogue.js'),
  read('data/activities.js'),
  read('core/model.js'),
  read('app.js'),
]);

const bundle = [
  '// FICHIER GÉNÉRÉ — modifier les sources, puis lancer npm run build:standalone.',
  stripExports(catalogue),
  stripExports(activities),
  stripExports(model),
  stripImports(app),
].join('\n\n');

const standalone = html
  .replace(/\s*<link rel="manifest"[^>]*\/>/, '')
  .replace(/\s*<link rel="stylesheet" href="\.\/app\.css"\/>/, `\n <style>\n${css}\n </style>`)
  .replace('<script type="module" src="./app.js"></script>', `<script>\n${bundle.replaceAll('</script', '<\\/script')}\n</script>`)
  .replace('<title>LifeQuest V3 · Prototype</title>', '<title>LifeQuest V3 · Aperçu local autonome</title>');

await Promise.all([
  writeFile(resolve(root, 'APERCU_LOCAL.html'), standalone, 'utf8'),
  writeFile(resolve(root, 'tests/standalone_bundle.js'), bundle, 'utf8'),
]);

console.log('Aperçu autonome et bundle de contrôle régénérés.');
