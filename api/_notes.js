// Shared note reader for /n/:id (api/note.js) and /feed.xml (api/feed.js). Not an endpoint (starts with _).
// Reads the notes straight out of index.html, which vercel.json bundles with both functions, so there's nothing
// to keep in sync: publish a note in index.html and its page and feed entry exist on the next deploy.
const fs = require('fs');
const path = require('path');

const SITE = 'https://ifti-gold.vercel.app'; // same address as the SHARE PREVIEW block in index.html; change both together
let cache = null;

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', mdash: '—', ndash: '–', hellip: '…' };
const decode = s => s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) =>
  e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1)) : (ENT[e] ?? m));
const text = html => decode(html.replace(/<span class="sn-ref">[\s\S]*?<\/span>/g, '').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// A summary for previews: the note's first paragraph, cut at a sentence end before ~200 characters.
function summary(p) {
  if (p.length <= 200) return p;
  const cut = p.slice(0, 200); let end = -1;
  // the last sentence end that isn't an abbreviation like "No. 1" or "e.g."
  for (const m of cut.matchAll(/[.?!](?=\s)/g)) if (!/\b(No|Mr|Mrs|Ms|Dr|St|vs|e\.g|i\.e)$/i.test(cut.slice(0, m.index))) end = m.index;
  return end > 60 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, '') + '…';
}

// Every note, newest first: { id: '005', no: 'N°005', title, date: '17 Oct 2026', iso, tags: [], first, summary, url, page }
function notes() {
  if (cache) return cache;
  const html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  const out = [];
  for (const m of html.matchAll(/<article class="page" id="n-(\d+)"(?: data-tags="([^"]*)")?>([\s\S]*?)<\/article>/g)) {
    const body = m[3];
    const date = (body.match(/<div class="note-head">[\s\S]*?<span class="label">[^<]*<\/span><span class="label">([^<]+)<\/span>/) || [])[1] || '';
    const title = text((body.match(/<h1>([\s\S]*?)<\/h1>/) || [])[1] || '');
    const first = text((body.match(/<\/h1>\s*<p>([\s\S]*?)<\/p>/) || [])[1] || '');
    const d = new Date(date + ' 09:00 GMT+0600'); // notes are dated in Dhaka
    out.push({
      id: m[1], no: 'N°' + m[1], title, date, iso: isNaN(d) ? null : d.toISOString(),
      tags: (m[2] || '').split(/\s+/).filter(Boolean), first, summary: summary(first),
      url: SITE + '/n/' + m[1], page: SITE + '/#n-' + m[1]
    });
  }
  out.sort((a, b) => (b.iso || '').localeCompare(a.iso || '') || b.id.localeCompare(a.id));
  return (cache = out);
}

// '5', '05', '005' and 'n-005' all find N°005.
function find(id) {
  const n = String(id || '').replace(/^n-?/i, '').replace(/\D/g, '');
  return n ? notes().find(x => +x.id === +n) || null : null;
}

module.exports = { SITE, notes, find, esc };
