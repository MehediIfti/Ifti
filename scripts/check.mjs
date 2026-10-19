// Runs on every push (see .github/workflows/check.yml) and works locally: node scripts/check.mjs
// 1. Every inline script in index.html, and app.js, must parse.  2. Every href="#id" (in the page or the script) must point to an id that exists.
// 3. index.html and app.js each stay under their size budget (gzipped), so the speed rules in the README hold as they grow.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
let failed = 0;

const dir = mkdtempSync(join(tmpdir(), 'check-'));
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)].filter(m => !/application\/ld\+json/.test(m[1]));
scripts.forEach((m, i) => {
  const f = join(dir, `s${i}.js`); writeFileSync(f, m[2]);
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); }
  catch (e) { failed++; console.error(`Script ${i + 1} does not parse:\n${e.stderr}`); }
});
try { execFileSync(process.execPath, ['--check', fileURLToPath(new URL('../app.js', import.meta.url))], { stdio: 'pipe' }); }
catch (e) { failed++; console.error(`app.js does not parse:\n${e.stderr}`); }
if (!html.includes('<script src="/app.js"></script>')) { failed++; console.error('index.html no longer loads app.js.'); }

const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
const generated = /^s-/; // section ids the search palette adds at runtime
const missing = [...new Set([...(html + app).matchAll(/href="#([^"]+)"/g)].map(m => m[1]))].filter(id => !/['"+\s]/.test(id)) // skip links built in JavaScript
  .filter(id => !ids.has(id) && !generated.test(id));
if (missing.length) { failed++; console.error('Links to ids that do not exist: ' + missing.map(x => '#' + x).join(', ')); }

// gzipped bytes; raise them on purpose, not by accident
const BUDGET = { 'index.html': 75 * 1024, 'app.js': 75 * 1024 }, kb = n => (n / 1024).toFixed(1);
const size = { 'index.html': gzipSync(html).length, 'app.js': gzipSync(app).length };
for (const f in BUDGET) if (size[f] > BUDGET[f]) { failed++; console.error(`${f} is ${kb(size[f])} KB gzipped, over its ${BUDGET[f] / 1024} KB budget.`); }

// 4. Contrast: in every palette, body text, secondary text and the faint text (--overlay1: dates, labels, captions) must reach
//    4.5:1 on the page and on panels (--base and --mantle), and every tag must reach 4.5:1 on its own tinted chip.
//    Light palettes darken tag text with the ink (TAG_INK below, same as the CSS). WCAG AA for small text.
const lum = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const mix = (a, b, t) => '#' + [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * t + parseInt(b.slice(i, i + 2), 16) * (1 - t)).toString(16).padStart(2, '0')).join('');
const TAG_INK = 0.65, TAGS = ['mauve', 'pink', 'peach', 'green', 'sky', 'yellow', 'teal', 'maroon', 'lavender'];
const low = [];
for (const m of html.matchAll(/:root(?:, :root)?\[data-palette="(\w+)"\] \{([^}]+)\}/g)) {
  const p = Object.fromEntries([...m[2].matchAll(/--([\w-]+): (#[0-9a-f]{6})/g)].map(x => [x[1], x[2]]));
  const light = /color-scheme: light/.test(m[2]);
  for (const t of ['text', 'subtext0', 'overlay1']) for (const bg of ['base', 'mantle']) {
    const r = ratio(p[t], p[bg]); if (r < 4.5) low.push(`${m[1]}: --${t} on --${bg} is ${r.toFixed(2)}:1`);
  }
  for (const t of TAGS) {
    const chip = mix(p[t], p.base, 0.12), ink = light ? mix(p[t], p.text, TAG_INK) : p[t], r = ratio(ink, chip);
    if (r < 4.5) low.push(`${m[1]}: tag --${t} is ${r.toFixed(2)}:1`);
  }
}
if (low.length) { failed++; console.error('Text below 4.5:1 contrast:\n  ' + low.join('\n  ')); }

console.log(`${scripts.length + 1} scripts checked, ${ids.size} ids, ${missing.length} broken anchor links, ${low.length} contrast problems. Gzipped: index.html ${kb(size['index.html'])} of 75 KB, app.js ${kb(size['app.js'])} of 75 KB.`);
process.exit(failed ? 1 : 0);
