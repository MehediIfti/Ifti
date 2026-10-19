// The notes as an Atom feed: GET /feed.xml (vercel.json rewrites it here). Any feed reader can follow the notebook.
// Each entry: title, date, the note's first paragraph, its tags, and a link to the note's own address (/n/005).
const { SITE, notes, esc } = require('./_notes');

module.exports = function handler(req, res) {
  const all = notes(), updated = (all[0] && all[0].iso) || new Date().toISOString();
  const entries = all.map(n => `  <entry>
    <title>${esc(n.no + ' · ' + n.title)}</title>
    <link rel="alternate" type="text/html" href="${n.url}"/>
    <id>${n.url}</id>
    <published>${n.iso || updated}</published>
    <updated>${n.iso || updated}</updated>
    <summary>${esc(n.first)}</summary>
${n.tags.map(t => `    <category term="${esc(t)}"/>`).join('\n')}
  </entry>`).join('\n');
  res.setHeader('Content-Type', 'application/atom+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(`<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Ifti's Notebook</title>
  <subtitle>Short notes on sales, clients and what I'm listening to. Mehedi Hasan Ifti, Dhaka.</subtitle>
  <link rel="self" type="application/atom+xml" href="${SITE}/feed.xml"/>
  <link rel="alternate" type="text/html" href="${SITE}/#notes"/>
  <id>${SITE}/</id>
  <updated>${updated}</updated>
  <author><name>Mehedi Hasan Ifti</name><uri>${SITE}/</uri></author>
  <icon>${SITE}/favicon.svg</icon>
${entries}
</feed>
`);
};
