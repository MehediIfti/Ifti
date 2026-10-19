// A note's own address: GET /n/005 (vercel.json rewrites it here as /api/note?id=005).
// Link previews (LinkedIn, X, Slack, WhatsApp) read this page's tags, so a shared note shows its own title and summary
// instead of the homepage's. People are sent straight on to the note in the notebook (/#n-005, or the section in the link).
const { SITE, find, esc } = require('./_notes');

module.exports = function handler(req, res) {
  const n = find(req.query.id);
  if (!n) { res.setHeader('Cache-Control', 'no-store'); res.writeHead(302, { Location: '/#notes' }); return res.end(); }
  if (req.query.id !== n.id) { res.writeHead(301, { Location: '/n/' + n.id }); return res.end(); } // one address per note: /n/5 → /n/005
  const title = n.title + ' · Ifti\'s Notebook', go = '/#n-' + n.id;
  const tags = n.tags.map(t => `<meta property="article:tag" content="${esc(t)}">`).join('\n');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Notes change only when the site deploys, and a deploy clears Vercel's cache, so an hour here costs nothing.
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(n.summary)}">
<link rel="canonical" href="${n.url}">
<link rel="alternate" type="application/atom+xml" title="Ifti's Notebook" href="${SITE}/feed.xml">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Ifti's Notebook">
<meta property="og:title" content="${esc(n.no + ' · ' + n.title)}">
<meta property="og:description" content="${esc(n.summary)}">
<meta property="og:url" content="${n.url}">
<meta property="og:image" content="${SITE}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Ifti's Notebook: Mehedi Hasan Ifti, sales and partnerships, Dhaka.">
${n.iso ? `<meta property="article:published_time" content="${n.iso}">\n` : ''}<meta property="article:author" content="Mehedi Hasan Ifti">
${tags}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@mehedi_ifti">
<meta name="twitter:creator" content="@mehedi_ifti">
<meta name="twitter:title" content="${esc(n.no + ' · ' + n.title)}">
<meta name="twitter:description" content="${esc(n.summary)}">
<meta name="twitter:image" content="${SITE}/og.png">
<script>location.replace(/^#s-n-\\d+-/.test(location.hash) ? '/' + location.hash : '${go}');</script>
<meta http-equiv="refresh" content="0; url=${go}">
<style>body{margin:0;padding:12vh 1.5rem;font:1rem/1.6 system-ui,sans-serif;background:#121212;color:#ededed}main{max-width:36rem;margin:auto}small{font-family:ui-monospace,monospace;color:#a0a0a0}a{color:#f7cafa}</style>
</head>
<body>
<main>
<small>${esc(n.no)} · ${esc(n.date)}</small>
<h1>${esc(n.title)}</h1>
<p>${esc(n.first)}</p>
<p><a href="${go}">Read it in the notebook →</a></p>
</main>
</body>
</html>`);
};
