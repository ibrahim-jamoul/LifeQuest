import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const port = Number(option('--port', process.env.PORT || 8000));
const host = option('--host', '127.0.0.1');

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

function safePath(pathname) {
  const decoded = decodeURIComponent(pathname).replaceAll('\\', '/');
  const requested = decoded === '/' ? '/index.html' : decoded;
  const target = resolve(ROOT, `.${requested}`);
  const fromRoot = relative(ROOT, target);
  if (fromRoot.startsWith('..') || isAbsolute(fromRoot)) return null;
  return target;
}

function parseRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header || '');
  if (!match) return null;
  if (!match[1] && !match[2]) return null;
  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!Number.isInteger(suffixLength) || suffixLength <= 0) return null;
    return { start: Math.max(0, size - suffixLength), end: size - 1 };
  }
  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : size - 1;
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= size) return null;
  return { start, end: Math.min(end, size - 1) };
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    let filePath = safePath(url.pathname);
    if (!filePath) {
      response.writeHead(403).end('Accès refusé');
      return;
    }

    let info = await stat(filePath);
    if (info.isDirectory()) {
      filePath = join(filePath, 'index.html');
      info = await stat(filePath);
    }

    const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
    const range = parseRange(request.headers.range, info.size);
    const headers = {
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-store',
      'Content-Type': type,
      'X-Content-Type-Options': 'nosniff',
    };

    if (request.headers.range && !range) {
      response.writeHead(416, { ...headers, 'Content-Range': `bytes */${info.size}` }).end();
      return;
    }

    if (range) {
      response.writeHead(206, {
        ...headers,
        'Content-Length': range.end - range.start + 1,
        'Content-Range': `bytes ${range.start}-${range.end}/${info.size}`,
      });
      if (request.method !== 'HEAD') createReadStream(filePath, range).pipe(response);
      else response.end();
      return;
    }

    response.writeHead(200, { ...headers, 'Content-Length': info.size });
    if (request.method !== 'HEAD') createReadStream(filePath).pipe(response);
    else response.end();
  } catch (error) {
    const code = error?.code === 'ENOENT' ? 404 : 500;
    response.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(code === 404 ? 'Fichier introuvable' : 'Erreur du serveur local');
  }
});

server.on('error', error => {
  console.error(`Impossible de démarrer le serveur LifeQuest : ${error.message}`);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`LifeQuest local : http://${host}:${port}`);
  console.log('Arrêt : Ctrl+C');
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
