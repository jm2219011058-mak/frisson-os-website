// Local dev server with auto-rebuild + live-reload. Run:  node dev.mjs
// Then open the printed URL. Editing src/ (or a git pull) auto-rebuilds dist/ and
// auto-refreshes the browser. Serving over http:// also makes the /zh/ pages work.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const PORT = 5173, ROOT = 'dist';
const MIME = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript',
  '.json':'application/json', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png',
  '.webp':'image/webp', '.avif':'image/avif', '.svg':'image/svg+xml', '.mp4':'video/mp4',
  '.xml':'application/xml', '.txt':'text/plain', '.ico':'image/x-icon' };

const clients = new Set();
let building = false, queued = false;
function build(reason){
  if (building){ queued = true; return; }
  building = true;
  try { execSync('node gen-i18n.mjs && node build.mjs', { stdio:'ignore' });
        console.log('  ✓ rebuilt (' + reason + ')  ' + new Date().toLocaleTimeString()); }
  catch { console.log('  ✗ build failed (' + reason + ') — check your edit'); }
  building = false;
  for (const r of clients) r.write('data: reload\n\n');
  if (queued){ queued = false; build('queued'); }
}

const RELOAD = '<script>try{new EventSource("/__reload").onmessage=function(){location.reload()}}catch(e){}</script>';
const server = http.createServer((req, res) => {
  if (req.url === '/__reload'){
    res.writeHead(200, { 'Content-Type':'text/event-stream', 'Cache-Control':'no-cache', 'Connection':'keep-alive' });
    res.write('\n'); clients.add(res); req.on('close', () => clients.delete(res)); return;
  }
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  if (p.endsWith('/')) p += 'index.html';
  const fp = path.join(ROOT, p);
  if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()){ res.writeHead(404); return res.end('Not found: ' + p); }
  const ext = path.extname(fp).toLowerCase();
  if (ext === '.html'){
    const html = fs.readFileSync(fp, 'utf8').replace('</body>', RELOAD + '</body>');
    res.writeHead(200, { 'Content-Type':'text/html; charset=utf-8' }); return res.end(html);
  }
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(fp).pipe(res);
});

let timer = null;
const trigger = (r) => { clearTimeout(timer); timer = setTimeout(() => build(r), 200); };
for (const d of ['src','i18n','assets']){ try { fs.watch(d, { recursive:true }, (e,f) => trigger(d + '/' + f)); } catch {} }
for (const f of ['content-inventory.md','gen-i18n.mjs','build.mjs']){ try { fs.watch(f, () => trigger(f)); } catch {} }

build('startup');
server.listen(PORT, () => console.log(
  '\n  ▶ Dev server running:  http://localhost:' + PORT + '/cities.html' +
  '\n  👀 Editing src/ or a git pull auto-rebuilds + auto-reloads the browser.' +
  '\n  Ctrl+C to stop.\n'));
