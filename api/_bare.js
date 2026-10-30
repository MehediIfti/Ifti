// The live-data functions take no parameters, so a query string is either a mistake or a way round Vercel's cache
// (?x=1, ?x=2… would reach Spotify, Google Calendar or Jolpica every time). Send it to the plain address, which is cached.
module.exports = function bare(req, res) {
  const i = req.url.indexOf('?');
  if (i < 0) return false;
  res.setHeader('Cache-Control', 'public, s-maxage=86400');
  res.writeHead(308, { Location: req.url.slice(0, i) });
  res.end();
  return true;
};
