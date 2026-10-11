import { createHash } from 'node:crypto';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'docs', 'SHA256_FINAL.json');
const excludedDirectories = new Set(['node_modules', 'test-results', 'playwright-report', '.git']);

async function collect(directory) {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await collect(absolute));
    else if (absolute !== output) paths.push(absolute);
  }
  return paths;
}

const files = [];
for (const absolute of (await collect(root)).sort()) {
  const [buffer, info] = await Promise.all([readFile(absolute), stat(absolute)]);
  files.push({
    path: relative(root, absolute).split(sep).join('/'),
    bytes: info.size,
    sha256: createHash('sha256').update(buffer).digest('hex'),
  });
}

const manifest = {
  generatedAt: new Date().toISOString(),
  scope: 'Copie locale finale, hors dépendances npm, rapports Playwright temporaires et métadonnées Git.',
  files,
};

await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`${files.length} fichiers référencés dans ${relative(root, output)}.`);
