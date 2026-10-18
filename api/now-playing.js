// What I'm playing on Spotify, for the stereo on every page but the homepage and the Music pop-up on it: GET /api/now-playing
// Also lists the last three songs before it (recent: [{ title, artist, url, playedAt }]).
// Needs SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET and SPOTIFY_REFRESH_TOKEN in Vercel (README → Spotify).
// Answers { configured: false } until they are set, so the page simply hides the player.
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
let cached = { token: null, until: 0 };

async function accessToken(id, secret, refresh) {
  if (cached.token && Date.now() < cached.until) return cached.token;
  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(id + ':' + secret).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh })
  });
  if (!r.ok) throw new Error('token ' + r.status);
  const d = await r.json();
  cached = { token: d.access_token, until: Date.now() + (d.expires_in - 60) * 1000 };
  return cached.token;
}

// A song or a podcast episode, trimmed to what the player shows. Spotify lists covers largest first (640, 300, 64); 300 stays sharp on the record label.
function shape(item) {
  const episode = item.type === 'episode';
  const images = (episode ? item.images : item.album && item.album.images) || [];
  return {
    kind: episode ? 'episode' : 'track',
    title: item.name,
    artist: episode ? (item.show && item.show.name) || '' : (item.artists || []).map(a => a.name).join(', '),
    art: (images[1] || images[0] || {}).url || null,
    url: (item.external_urls && item.external_urls.spotify) || null,
    duration: item.duration_ms || 0
  };
}

module.exports = async function handler(req, res) {
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } = process.env;
  // Every visitor asks every 30 seconds; Vercel's cache answers most of them so Spotify sees about two calls a minute.
  res.setHeader('Cache-Control', 'public, s-maxage=20, stale-while-revalidate=40');
  if (!id || !secret || !refresh) return res.status(200).json({ configured: false });
  try {
    const auth = { headers: { Authorization: 'Bearer ' + await accessToken(id, secret, refresh) } };
    // Both questions at once: what's on, and the last few songs (four, in case the first one has to stand in for "now").
    const [now, rec] = await Promise.all([
      fetch('https://api.spotify.com/v1/me/player/currently-playing?additional_types=track,episode', auth),
      fetch('https://api.spotify.com/v1/me/player/recently-played?limit=4', auth)
    ]);
    const played = ((rec.ok && (await rec.json()).items) || []).map(i => ({ ...shape(i.track), playedAt: i.played_at }));
    const list = items => items.slice(0, 3).map(t => ({ title: t.title, artist: t.artist, url: t.url, playedAt: t.playedAt }));
    if (now.status === 200) {
      const d = await now.json();
      if (d && d.item) return res.status(200).json({ configured: true, playing: !!d.is_playing, progress: d.progress_ms || 0, ...shape(d.item), recent: list(played) });
    }
    // Nothing on right now (204), or a private session: show the last song instead, and the three before it.
    if (played[0]) return res.status(200).json({ configured: true, playing: false, ...played[0], recent: list(played.slice(1)) });
    return res.status(200).json({ configured: true, playing: false, recent: [] });
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ configured: true, error: 'Spotify did not answer' });
  }
};
