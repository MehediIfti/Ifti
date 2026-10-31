// What I'm playing on Spotify, for the stereo on every page but the homepage and the Music pop-up on it: GET /api/now-playing
// Also lists the last three songs before it (recent: [{ title, artist, url, playedAt }]).
// Needs SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET and SPOTIFY_REFRESH_TOKEN in Vercel (README → Spotify).
// Answers { configured: false } until they are set, so the page simply hides the player.
// With a Redis store connected (Vercel → Storage → Upstash Redis), it also saves the last few things it saw playing,
// podcasts included, so the list still shows when Spotify's own history comes back empty.
const bare = require('./_bare');
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const KEY = 'spotify:recent', KEEP = 4;
let cached = { token: null, until: 0 };

// Upstash's REST API, no package needed. Vercel's Upstash integration names the variables KV_REST_API_*; a direct Upstash setup names them UPSTASH_REDIS_REST_*.
function store() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const run = async cmd => {
    const r = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: JSON.stringify(cmd) });
    if (!r.ok) throw new Error('store ' + r.status);
    return (await r.json()).result;
  };
  return {
    read: async () => { try { const l = JSON.parse(await run(['GET', KEY]) || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; } },
    write: list => run(['SET', KEY, JSON.stringify(list)]).catch(() => {})
  };
}

// Only https links leave this function, whether they came from Spotify or from the saved list, so a bad value can't
// turn into a javascript: link or an http image on the page.
const https = u => typeof u === 'string' && /^https:\/\//.test(u) ? u : null;
const clean = t => t && typeof t === 'object' ? { ...t, title: String(t.title || ''), artist: String(t.artist || ''), url: https(t.url), art: https(t.art), playedAt: String(t.playedAt || '') } : null;

// Newest first, one row per song (the latest time it was heard), at most KEEP rows.
function merge(...lists) {
  const seen = new Set();
  return lists.flat().map(clean).filter(t => t && t.title && t.playedAt)
    .sort((a, b) => b.playedAt.localeCompare(a.playedAt))
    .filter(t => { const k = t.url || t.title + '|' + t.artist; return !seen.has(k) && seen.add(k); })
    .slice(0, KEEP);
}

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
    art: https((images[1] || images[0] || {}).url),
    url: https(item.external_urls && item.external_urls.spotify),
    duration: item.duration_ms || 0
  };
}

module.exports = async function handler(req, res) {
  if (bare(req, res)) return;
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
    const db = store();
    const [items, saved] = await Promise.all([rec.ok ? rec.json().then(d => d.items || []) : [], db ? db.read() : []]);
    const fromSpotify = items.map(i => ({ ...shape(i.track), playedAt: i.played_at }));
    const list = items => items.slice(0, 3).map(t => ({ title: t.title, artist: t.artist, url: t.url, playedAt: t.playedAt }));
    const d = now.status === 200 ? await now.json() : null;
    const current = d && d.item ? { ...shape(d.item), playedAt: new Date().toISOString() } : null;
    // Spotify's history skips podcasts and anything under 30 seconds; the saved list fills those in.
    const played = merge(current && d.is_playing ? [current] : [], fromSpotify, saved);
    if (db && JSON.stringify(played) !== JSON.stringify(saved)) await db.write(played);
    if (current) {
      const others = played.filter(t => (t.url || t.title) !== (current.url || current.title));
      return res.status(200).json({ configured: true, playing: !!d.is_playing, progress: d.progress_ms || 0, ...shape(d.item), recent: list(others) });
    }
    // Nothing on right now (204), or a private session: show the last song instead, and the three before it.
    if (played[0]) return res.status(200).json({ configured: true, playing: false, ...played[0], recent: list(played.slice(1)) });
    return res.status(200).json({ configured: true, playing: false, recent: [] });
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ configured: true, error: 'Spotify did not answer' });
  }
};
