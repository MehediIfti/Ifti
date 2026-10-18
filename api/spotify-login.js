// One-time setup: sends me to Spotify to allow the site to read what I'm playing. GET /api/spotify-login?key=<SPOTIFY_SETUP_KEY>
// Locked by SPOTIFY_SETUP_KEY. Delete that variable in Vercel once SPOTIFY_REFRESH_TOKEN is saved, and this page stops working.
module.exports = function handler(req, res) {
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_SETUP_KEY: key } = process.env;
  if (!key || !id) return res.status(404).send('Not set up. Add SPOTIFY_CLIENT_ID and SPOTIFY_SETUP_KEY in Vercel first.');
  if (req.query.key !== key) return res.status(403).send('Wrong key.');
  const q = new URLSearchParams({
    client_id: id,
    response_type: 'code',
    redirect_uri: 'https://' + req.headers.host + '/api/spotify-callback',
    scope: 'user-read-currently-playing user-read-recently-played',
    state: key
  });
  res.setHeader('Cache-Control', 'no-store');
  res.redirect(302, 'https://accounts.spotify.com/authorize?' + q);
};
