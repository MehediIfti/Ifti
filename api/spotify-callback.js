// One-time setup, step two: Spotify sends me back here with a code, and this page shows the refresh token to save in Vercel.
// Only works while SPOTIFY_SETUP_KEY is set, and only for the visit that started at /api/spotify-login with that key.
const same = require('./_secret');
// Anything Spotify or the address bar sends back is shown as plain text, never as HTML.
const plain = (res, code, msg) => { res.setHeader('Content-Type', 'text/plain; charset=utf-8'); return res.status(code).send(msg); };

module.exports = async function handler(req, res) {
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_SETUP_KEY: key } = process.env;
  res.setHeader('Cache-Control', 'no-store');
  if (!key || !id || !secret) return plain(res, 404, 'Not set up.');
  if (!same(req.query.state, key)) return plain(res, 403, 'Wrong key.');
  if (req.query.error) return plain(res, 400, 'Spotify said: ' + String(req.query.error).slice(0, 100) + '. Start again at /api/spotify-login.');
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(id + ':' + secret).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code: String(req.query.code || ''), redirect_uri: 'https://' + req.headers.host + '/api/spotify-callback' })
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.refresh_token) return plain(res, 400, 'Could not get a token: ' + String(d.error_description || d.error || r.status).slice(0, 200) + '. Start again at /api/spotify-login.');
  const t = String(d.refresh_token).replace(/[<>&"]/g, '');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send('<!doctype html><meta name="viewport" content="width=device-width"><title>Spotify connected</title>' +
    '<body style="font:16px/1.5 system-ui;max-width:40rem;margin:3rem auto;padding:0 1rem">' +
    '<h1>Almost done</h1><p>1. In Vercel → Settings → Environment Variables, add <b>SPOTIFY_REFRESH_TOKEN</b> with this value:</p>' +
    '<textarea readonly rows="4" style="width:100%;font:13px monospace" onclick="this.select()">' + t + '</textarea>' +
    '<p>2. Delete <b>SPOTIFY_SETUP_KEY</b> so this page stops working.</p><p>3. Redeploy. The player shows up on the Now page.</p>' +
    '<p>Keep this token private. Anyone who has it can see what you play.</p></body>');
};
