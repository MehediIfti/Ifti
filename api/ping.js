// A tiny check that server functions work on Vercel: GET /api/ping
// Live features (Notion sync, Spotify, calendar status) will live next to this file.
module.exports = function handler(req, res) {
  res.status(200).json({ ok: true, at: new Date().toISOString() });
};
