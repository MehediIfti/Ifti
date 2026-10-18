// Local only (needs Playwright, so it isn't in CI): node scripts/check-layout.mjs
// Opens every page in four themes at 390, 700, 820 and 1440 px and fails if the reading column is under 300 px,
// the page scrolls sideways, or the script throws. check.mjs can't see these: a squashed column throws no error.
// No Playwright in node_modules? Point PLAYWRIGHT at it: PLAYWRIGHT=/path/to/node_modules/playwright node scripts/check-layout.mjs
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || 'playwright');
const root = fileURLToPath(new URL('..', import.meta.url));
const TYPES = { '.html': 'text/html', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.pdf': 'application/pdf' };
const THEMES = { // the same values as THEMES[].set in index.html
  cropmark: { palette: 'cropmark', bg: 'plain', calm: 'margins', layout: '3', type: 'sans' },
  'midnight-ledger': { palette: 'black', bg: 'grid', calm: 'spotlight', layout: '3', type: 'serif' },
  halftone: { palette: 'halftone', bg: 'dots', calm: 'margins', layout: '3', type: 'mono' },
  lightsout: { palette: 'lightsout', bg: 'lines', calm: 'margins', layout: '3', type: 'sans' }
};
const WIDTHS = [390, 700, 820, 1440], MIN_COLUMN = 300;

const server = createServer(async (req, res) => {
  const path = decodeURIComponent(req.url.split('?')[0]);
  if (path.startsWith('/api/')) { res.writeHead(404); return res.end(); } // live data stays off: the layout must hold without it
  try { const body = await readFile(join(root, path === '/' ? 'index.html' : path)); res.writeHead(200, { 'content-type': TYPES[extname(path) || '.html'] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const url = `http://localhost:${server.address().port}/`;

const browser = await chromium.launch(), problems = [];
let pages = 0;
for (const [theme, set] of Object.entries(THEMES)) for (const width of WIDTHS) {
  const phone = width <= 760;
  const ctx = await browser.newContext({ viewport: { width, height: phone ? 844 : 900 }, isMobile: phone, hasTouch: phone });
  await ctx.addInitScript(a => { localStorage.setItem('booted', '1'); localStorage.setItem('ap-theme', a.theme); localStorage.setItem('ap-resolved', JSON.stringify(a)); }, { theme, ...set });
  const page = await ctx.newPage();
  page.on('pageerror', e => problems.push(`${theme} ${width}px: script error: ${e.message}`));
  await page.goto(url); await page.waitForTimeout(400);
  const ids = await page.evaluate(() => [...document.querySelectorAll('.page[id]')].map(p => p.id));
  for (const id of ids) {
    await page.evaluate(h => { location.hash = h; }, id); await page.waitForTimeout(120);
    const m = await page.evaluate(() => ({ column: Math.round(document.querySelector('main').getBoundingClientRect().width), wide: document.documentElement.scrollWidth - innerWidth }));
    if (m.column < MIN_COLUMN) problems.push(`${theme} ${width}px #${id}: reading column is ${m.column}px`);
    if (m.wide > 0) problems.push(`${theme} ${width}px #${id}: scrolls sideways by ${m.wide}px`);
    pages++;
  }
  await ctx.close();
}
await browser.close(); server.close();

problems.forEach(p => console.error(p));
console.log(`${pages} page views checked in ${Object.keys(THEMES).length} themes at ${WIDTHS.join(', ')} px: ${problems.length} problems.`);
process.exit(problems.length ? 1 : 0);
