#!/usr/bin/env node
/* check-css.mjs — catch styles that were deleted while their markup stayed behind.
 *
 * Written 2026-07-28 after three separate accidents in one day: editing CSS with a regex
 * RANGE (from a comment to a selector) silently swallowed neighbouring blocks, because this
 * stylesheet repeats comment wording across sections. Twice caught locally; the third shipped
 * — .sheet lost its rules and its close button rendered as a bare "x" in the top-left corner
 * of every sona page, on desktop too.
 *
 * Run it after deleting or moving any block of CSS:   node check-css.mjs
 * Exits 1 if anything is orphaned, so it can gate a commit.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'src';
const SHARED = ['assets/type.css'];

/* Classes that are deliberately unstyled: JS toggles them, or they are only ever selector
   hooks / SVG elements driven by attributes. Verified against git history — none of these
   ever had a rule. Add to this list only after checking the same way. */
const IGNORE = new Set([
  /* state, toggled by JS */
  'reveal', 'in', 'on', 'open', 'cur', 'drag', 'live', 'ready', 'hidden',
  /* selector hooks with no styling of their own */
  'lead', 'center', 'sec', 'hiw', 'moon-hero',
  /* sona #s4 beads: sized and transformed via setAttribute, never via CSS */
  'hit', 's4b-h', 's4b-v', 's4b-tint', 's4b-off',
]);

function classesUsed(html) {
  const found = new Set();
  const add = (s) => String(s).split(/\s+/).forEach((c) => c && found.add(c));
  /* plain markup */
  for (const m of html.matchAll(/\bclass="([^"{}]+)"/g)) add(m[1]);
  for (const m of html.matchAll(/\bclass='([^'{}]+)'/g)) add(m[1]);
  /* built by JS: el.className='…', {'class':'…'}, createElement + className */
  for (const m of html.matchAll(/className\s*=\s*['"]([^'"]+)['"]/g)) add(m[1]);
  for (const m of html.matchAll(/['"]class['"]\s*:\s*['"]([^'"]+)['"]/g)) add(m[1]);
  for (const m of html.matchAll(/classList\.(?:add|toggle)\(\s*['"]([^'"]+)['"]/g)) add(m[1]);
  return found;
}

const shared = SHARED.map((f) => readFileSync(f, 'utf8')).join('\n');
let orphans = 0;

for (const file of readdirSync(SRC).filter((f) => f.endsWith('.html'))) {
  const html = readFileSync(join(SRC, file), 'utf8');
  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n') + shared;
  const markup = html.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '');

  const missing = [...classesUsed(html)]
    /* a real class name only — drops i18n tokens and fragments of JS string concatenation */
    .filter((c) => /^[A-Za-z][\w-]*$/.test(c))
    .filter((c) => !IGNORE.has(c))
    /* a rule can be `.x{`, `.x.y{`, `.x `, `.x:hover`, `.x,` … — just look for the token */
    .filter((c) => !new RegExp('\\.' + c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\w-])').test(css))
    .sort();

  if (missing.length) {
    orphans += missing.length;
    console.log(`${file}`);
    for (const c of missing) console.log(`  .${c}  — used in markup, no rule anywhere`);
  }
}

if (orphans) {
  console.log(`\n${orphans} orphaned class(es). Either the CSS was deleted by mistake, or the`);
  console.log(`class is JS/attribute-driven — add it to IGNORE in check-css.mjs if so.`);
  process.exit(1);
}
console.log('No orphaned classes.');
