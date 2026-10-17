// Runs on every push (see .github/workflows/check.yml) and works locally: node scripts/check.mjs
// 1. Every inline script in index.html must parse.  2. Every href="#id" must point to an id that exists.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
let failed = 0;

const dir = mkdtempSync(join(tmpdir(), 'check-'));
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)].filter(m => !/application\/ld\+json/.test(m[1]));
scripts.forEach((m, i) => {
  const f = join(dir, `s${i}.js`); writeFileSync(f, m[2]);
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); }
  catch (e) { failed++; console.error(`Script ${i + 1} does not parse:\n${e.stderr}`); }
});

const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
const generated = /^s-/; // section ids the search palette adds at runtime
const missing = [...new Set([...html.matchAll(/href="#([^"]+)"/g)].map(m => m[1]))].filter(id => !/['"+\s]/.test(id)) // skip links built in JavaScript
  .filter(id => !ids.has(id) && !generated.test(id));
if (missing.length) { failed++; console.error('Links to ids that do not exist: ' + missing.map(x => '#' + x).join(', ')); }

console.log(`${scripts.length} scripts checked, ${ids.size} ids, ${missing.length} broken anchor links.`);
process.exit(failed ? 1 : 0);
