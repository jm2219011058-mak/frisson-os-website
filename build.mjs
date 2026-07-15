// FRISSON multilingual static build.
// Source pages live in /src as templates with {{key}} tokens and marker comments.
// Text comes from /i18n/<lang>.json (missing keys fall back to English).
// Output: /dist  — English at the root, Chinese under /zh/.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'src';
const DIST = 'dist';
const SITE = 'https://frisson-os.com';
const DEFAULT = 'en';
const LANGS = [
  { code: 'en', dir: 'ltr', base: '' },
  { code: 'zh', dir: 'ltr', base: 'zh/' },
];

const dict = {};
for (const L of LANGS) {
  const p = `i18n/${L.code}.json`;
  dict[L.code] = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
}
const tr = (lang, key) => {
  const k = key.trim();
  if (dict[lang] && dict[lang][k] != null) return dict[lang][k];
  if (dict[DEFAULT] && dict[DEFAULT][k] != null) return dict[DEFAULT][k]; // fallback EN
  return '⟪' + k + '⟫'; // visible marker if a key is undefined anywhere
};

// clean text link to a page in a given language, from the site root
const pageUrl = (base, page) => '/' + base + (page === 'index.html' ? '' : page);

const LANG_NAME = { en: 'English', zh: '中文' };   // full name — inside the dropdown
const LANG_SHORT = { en: 'EN', zh: '中文' };        // short code — on the button
function switcher(lang, page) {
  const items = LANGS.map(L =>
    `<a href="${pageUrl(L.base, page)}"${L.code === lang ? ' class="cur" aria-current="true"' : ''}>${LANG_NAME[L.code]}</a>`
  ).join('');
  return '<details class="langsel"><summary aria-label="Language">' +
    '<svg class="ls-globe" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>' +
    `<span class="ls-cur">${LANG_SHORT[lang]}</span>` +
    '<svg class="ls-chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4"/></svg>' +
    `</summary><div class="ls-menu">${items}</div></details>`;
}

const SWITCH_CSS = `<style>
picture{display:contents;}
.nav{justify-content:flex-start;}
.nav .brand{margin-right:auto;}
.langsel{position:relative;display:inline-flex;align-items:center;margin-left:clamp(14px,2.5vw,30px);font-family:var(--sans,-apple-system,Arial,sans-serif);font-size:13px;letter-spacing:.04em;line-height:1;color:#2b1d12;}
.langsel>summary{list-style:none;cursor:pointer;display:inline-flex;align-items:center;gap:7px;line-height:1;opacity:.78;transition:opacity .2s;white-space:nowrap;}
.langsel>summary::-webkit-details-marker{display:none;}
.langsel>summary:hover{opacity:1;}
.ls-globe{display:block;width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.5;}
.ls-chev{display:block;width:10px;height:10px;stroke:currentColor;fill:none;stroke-width:1.7;transition:transform .25s;}
.langsel[open]>summary .ls-chev{transform:rotate(180deg);}
.ls-menu{position:absolute;top:calc(100% + 12px);right:0;background:#fff;border:1px solid rgba(43,29,18,.12);border-radius:10px;box-shadow:0 12px 30px rgba(43,29,18,.14);padding:6px;min-width:132px;display:flex;flex-direction:column;gap:2px;z-index:90;}
.ls-menu a{padding:9px 14px;border-radius:7px;color:#2b1d12;text-decoration:none;opacity:.68;white-space:nowrap;transition:background .2s,opacity .2s;}
.ls-menu a:hover{background:rgba(43,29,18,.05);opacity:1;}
.ls-menu a.cur{opacity:1;color:var(--accent,#e07b3c);}
@media (max-width:680px){
  .langsel{order:2;}
  .nav .menu-btn{order:3;margin-left:clamp(14px,4vw,22px);}
}
</style>`;

function hreflang(page) {
  const rows = LANGS.map(L =>
    `<link rel="alternate" hreflang="${L.code}" href="${SITE}${pageUrl(L.base, page)}">`
  );
  rows.push(`<link rel="alternate" hreflang="x-default" href="${SITE}${pageUrl('', page)}">`);
  return rows.join('\n');
}

// Clean dist resiliently — cloud-sync (iCloud/Dropbox) can leave locked "assets 2"
// duplicate folders that make a plain recursive rm throw; remove what we can and go on.
try { fs.rmSync(DIST, { recursive: true, force: true }); }
catch { for (const e of fs.readdirSync(DIST)) { try { fs.rmSync(path.join(DIST, e), { recursive: true, force: true }); } catch {} } }
fs.mkdirSync(DIST, { recursive: true });

const pages = fs.readdirSync(SRC).filter(f => f.endsWith('.html'));

// ---- Responsive image pipeline ----
// Pre-generate WebP variants at several widths for each <img> raster asset, so browsers fetch a
// device-appropriate size (mobile pulls a small one, desktop a large one) instead of the full JPEG.
const IMG_WIDTHS = [480, 960, 1440, 1920];
const variants = {};   // 'city/hero.jpg' -> [480, 960, 1440]
{
  const refs = new Set();
  for (const page of pages) {
    const html = fs.readFileSync(path.join(SRC, page), 'utf8');
    for (const m of html.matchAll(/<img[^>]*\ssrc="(?:\.\.\/)?assets\/([^"?]+?\.(?:jpe?g|png))/gi)) refs.add(m[1]);
  }
  for (const rel of refs) {
    const srcAbs = path.join('assets', rel);
    if (!fs.existsSync(srcAbs)) continue;
    let meta; try { meta = await sharp(srcAbs).metadata(); } catch { continue; }
    const ow = meta.width || 0;
    if (ow < 700) continue;                                       // too small to bother
    const widths = IMG_WIDTHS.filter(w => w <= ow);
    if (ow <= 1920 && !widths.includes(ow)) widths.push(ow);      // near-original for large screens
    if (!widths.length) continue;
    variants[rel] = widths;
    const relNoExt = rel.replace(/\.(jpe?g|png)$/i, '');
    fs.mkdirSync(path.join(DIST, 'assets', path.dirname(rel)), { recursive: true });
    for (const w of widths) {
      try { await sharp(srcAbs).resize({ width: w }).webp({ quality: 74 }).toFile(path.join(DIST, 'assets', relNoExt + '-' + w + '.webp')); }
      catch (e) { console.warn('img variant fail', rel, e.message); }
    }
  }
  console.log('Responsive WebP variants generated for', Object.keys(variants).length, 'images');
}

for (const page of pages) {
  const tpl = fs.readFileSync(path.join(SRC, page), 'utf8');
  for (const L of LANGS) {
    let out = tpl.replace(/\{\{([^}]+)\}\}/g, (_, k) => tr(L.code, k));
    out = out.replace(/<html[^>]*>/, `<html lang="${L.code}" dir="${L.dir}">`);
    out = out.replace('<!--HREFLANG-->', hreflang(page));
    out = out.replace(/<!--LANGNAV-->/g, page === 'index.html' ? '' : switcher(L.code, page));   // home (frisson) page: no language switcher
    out = out.replace('</head>', SWITCH_CSS + '\n</head>');
    // Make Google Fonts CSS non-render-blocking (load async; font-display:swap already shows fallback text immediately).
    // This removes the biggest render-blocking item (esp. the ~91KB Noto Serif SC unicode-range CSS).
    out = out.replace(/<link href="(https:\/\/fonts\.googleapis\.com\/css2[^"]*)" rel="stylesheet">/g,
      '<link rel="stylesheet" href="$1" media="print" onload="this.media=\'all\'"><noscript><link rel="stylesheet" href="$1"></noscript>');
    // Defer render-blocking <head> scripts (GSAP libs + logo custom element). Their inline consumers boot on gsap-ready / DOMContentLoaded so deferring doesn't disable animations.
    out = out.replace(/<script src="(assets\/vendor\/gsap\/[^"]+|assets\/frisson-logo-animated\.js[^"]*)"><\/script>/g,
      '<script defer src="$1"></script>');
    // "Load ahead while reading": after load + idle, warm below-fold lazy images into cache (low priority) so scrolling is instant. Skips data-saver/slow networks.
    out = out.replace('</body>',
      '<script>(function(){var c=navigator.connection;if(c&&(c.saveData||/(^|-)2g$/.test(c.effectiveType||"")))return;'
      + 'function warm(){var s={};document.querySelectorAll(\'img[loading="lazy"]\').forEach(function(im){var u=im.currentSrc||im.getAttribute("src");if(!u||s[u])return;s[u]=1;var p=new Image();if("fetchPriority" in p)p.fetchPriority="low";p.src=u;});}'
      + 'function go(){(window.requestIdleCallback||function(f){setTimeout(f,800);})(warm);}'
      + 'if(document.readyState==="complete")go();else addEventListener("load",go);})();</script>\n</body>');
    if (L.base) {
      // pages served from /zh/ reach assets one level up (works on server and local file://).
      // Broad match so JS-built paths like  img:"assets/..."  are rewritten too.
      out = out.replace(/(["'])assets\//g, '$1../assets/');
      out = out.replace(/url\(assets\//g, 'url(../assets/');
    }
    // Rewrite <img> raster tags → <picture> with a WebP srcset so the browser picks a device-appropriate size.
    // Non-WebP browsers fall back to the original file. Done after the zh path rewrite so prefixes are correct.
    {
      const pfx = L.base ? '../' : '';
      out = out.replace(/<img\s([^>]*?)src="(?:\.\.\/)?assets\/([^"?]+?)\.(jpe?g|png)((?:\?[^"]*)?)"([^>]*?)>/gi,
        (m, pre, relNoExt, ext, query, post) => {
          const ws = variants[relNoExt + '.' + ext.toLowerCase()];
          if (!ws || !ws.length) return m;
          const webpSet = ws.map(w => `${pfx}assets/${relNoExt}-${w}.webp ${w}w`).join(', ');
          const attrs = (pre + post).replace(/\s+/g, ' ').trim();
          const sizes = /\bsizes=/.test(attrs) ? '' : ' sizes="100vw"';
          return `<picture><source type="image/webp" srcset="${webpSet}" sizes="100vw"><img ${attrs}${sizes} src="${pfx}assets/${relNoExt}.${ext}${query}"></picture>`;
        });
    }
    const outDir = path.join(DIST, L.base);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, page), out);
  }
}

// static assets & root files — robust per-file recursive copy (works on Netlify and locally)
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name), d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else { try { fs.copyFileSync(s, d); } catch (e) { console.warn('skip asset', s, e.code); } }
  }
}
copyDir('assets', path.join(DIST, 'assets'));
for (const f of ['robots.txt', 'sitemap.xml']) {
  if (fs.existsSync(f)) { try { fs.copyFileSync(f, path.join(DIST, f)); } catch {} }
}
console.log(`Built ${pages.length} page(s) × ${LANGS.length} language(s) → /${DIST}`);
