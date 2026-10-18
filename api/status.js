// Am I free right now? For the status under my name on every page: GET /api/status
// Reads only free/busy from my work calendar through a Google service account. The calendar is shared with that account as
// "See only free/busy", so no meeting titles or details ever reach the site. Setup: README → Calendar status.
// Needs GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY and GOOGLE_CALENDAR_ID in Vercel. Answers { configured: false } until then.
const crypto = require('crypto');

const HOURS = { days: [0, 1, 2, 3, 4], start: 10, end: 19 }; // Sunday to Thursday, 10:00 to 19:00 Dhaka time
const DHAKA = 6 * 3600e3; // UTC+6 all year, no daylight saving
let cached = { token: null, until: 0 };

async function accessToken(email, key) {
  if (cached.token && Date.now() < cached.until) return cached.token;
  const now = Math.floor(Date.now() / 1000);
  const part = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  const body = part({ alg: 'RS256', typ: 'JWT' }) + '.' + part({ iss: email, scope: 'https://www.googleapis.com/auth/calendar.freebusy', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 });
  const jwt = body + '.' + crypto.createSign('RSA-SHA256').update(body).sign(key, 'base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt })
  });
  if (!r.ok) throw new Error('token ' + r.status);
  const d = await r.json();
  cached = { token: d.access_token, until: Date.now() + (d.expires_in - 60) * 1000 };
  return cached.token;
}

// Working hours, read on a Dhaka clock (shift by +6h, then use the UTC getters).
function inHours(t) { const d = new Date(t + DHAKA); return HOURS.days.includes(d.getUTCDay()) && d.getUTCHours() >= HOURS.start && d.getUTCHours() < HOURS.end; }
function nextOpen(t) {
  const d = new Date(t + DHAKA), midnight = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - DHAKA;
  for (let i = 0; i < 8; i++) {
    const open = midnight + i * 864e5 + HOURS.start * 36e5;
    if (open > t && HOURS.days.includes(new Date(open + DHAKA).getUTCDay())) return open;
  }
}

module.exports = async function handler(req, res) {
  const { GOOGLE_CLIENT_EMAIL: email, GOOGLE_PRIVATE_KEY: rawKey, GOOGLE_CALENDAR_ID: cal } = process.env;
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  if (!email || !rawKey || !cal) return res.status(200).json({ configured: false });
  const now = Date.now();
  if (!inHours(now)) return res.status(200).json({ configured: true, state: 'off', back: new Date(nextOpen(now)).toISOString() });
  try {
    const key = rawKey.replace(/\\n/g, '\n'); // Vercel keeps the key's line breaks as \n
    const r = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + await accessToken(email, key), 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeMin: new Date(now - 60e3).toISOString(), timeMax: new Date(now + 12 * 36e5).toISOString(), items: [{ id: cal }] })
    });
    const d = await r.json();
    const c = d.calendars && d.calendars[cal];
    if (!r.ok || !c || c.errors) throw new Error('freebusy ' + r.status + ' ' + JSON.stringify(c && c.errors));
    // Busy blocks come back in order. Join back-to-back meetings so "free at" is when I'm actually free.
    const blocks = c.busy.map(b => [Date.parse(b.start), Date.parse(b.end)]);
    let until = 0;
    for (const [s, e] of blocks) if (s <= Math.max(now, until) + 60e3 && e > now) until = Math.max(until, e);
    if (until) return res.status(200).json({ configured: true, state: 'busy', until: new Date(until).toISOString() });
    return res.status(200).json({ configured: true, state: 'free' });
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ configured: true, error: 'Calendar did not answer' });
  }
};
