import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const index = fileURLToPath(new URL('./index.html', import.meta.url));
const port = Number(process.env.PORT || 4173);
createServer(async (req, res) => {
  const pathname = new URL(req.url || '/', 'http://localhost').pathname;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
  }
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : JSON.stringify({ status: 'ok', service: 't2-courier-preview', mode: 'demo' }));
    return;
  }
  if (pathname !== '/') {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Topilmadi'); return;
  }
  try {
    const html = await readFile(index);
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    });
    res.end(req.method === 'HEAD' ? undefined : html);
  } catch {
    res.writeHead(500); res.end();
  }
}).listen(port, '0.0.0.0', () => console.log('T2 Courier preview listening on ' + port));
