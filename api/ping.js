// A tiny check that server functions work on Vercel: GET /api/ping
// The live features (Spotify, calendar status, activity, F1, weather, notes) are the other files here.
module.exports = function handler(req, res) {
  res.status(200).json({ ok: true, at: new Date().toISOString() });
};
