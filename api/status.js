// Am I free right now? For the status under my name on every page: GET /api/status
// Reads my work calendar through its secret iCal address (GOOGLE_ICS_URL in Vercel; README → Calendar status) and
// answers only free, busy-until or off-the-clock. Meeting titles and details never leave this function.
const ical = require('node-ical');

const HOURS = { days: [0, 1, 2, 3, 4], start: 10, end: 19 }; // Sunday to Thursday, 10:00 to 19:00 Dhaka time
const DHAKA = 6 * 3600e3; // UTC+6 all year, no daylight saving

// Working hours, read on a Dhaka clock (shift by +6h, then use the UTC getters).
function inHours(t) { const d = new Date(t + DHAKA); return HOURS.days.includes(d.getUTCDay()) && d.getUTCHours() >= HOURS.start && d.getUTCHours() < HOURS.end; }
function nextOpen(t) {
  const d = new Date(t + DHAKA), midnight = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - DHAKA;
  for (let i = 0; i < 8; i++) {
    const open = midnight + i * 864e5 + HOURS.start * 36e5;
    if (open > t && HOURS.days.includes(new Date(open + DHAKA).getUTCDay())) return open;
  }
}

// Does this event block my time? Not if it's all-day, marked Free, cancelled, or one I declined.
function blocks(ev, me) {
  if (ev.status === 'CANCELLED' || ev.transparency === 'TRANSPARENT') return false;
  const people = [].concat(ev.attendee || []);
  return !people.some(a => a && a.params && a.params.PARTSTAT === 'DECLINED' && String(a.val || '').toLowerCase().endsWith(me));
}

// Busy blocks overlapping the next 12 hours, as [start, end] in ms.
function busyBlocks(data, now) {
  const cal = Object.values(data).find(x => x.type === 'VCALENDAR') || {};
  const me = String(cal['WR-CALNAME'] || '').toLowerCase(); // Google names a calendar after its owner's email
  const from = new Date(now - 864e5), to = new Date(now + 12 * 36e5), out = [];
  for (const ev of Object.values(data)) {
    if (ev.type !== 'VEVENT' || !ev.start) continue;
    let list;
    try { list = ical.expandRecurringEvent(ev, { from, to, expandOngoing: true }); } catch (e) { continue; }
    for (const x of list) {
      if (x.isFullDay || !blocks(x.event || ev, me)) continue;
      const s = +x.start, e = +x.end;
      if (e > now && s < +to) out.push([s, e]);
    }
  }
  return out.sort((a, b) => a[0] - b[0]);
}

function status(data, now) {
  if (!inHours(now)) return { configured: true, state: 'off', back: new Date(nextOpen(now)).toISOString() };
  // Join back-to-back meetings so "free at" is when I'm actually free.
  let until = 0;
  for (const [s, e] of busyBlocks(data, now)) if (s <= Math.max(now, until) + 60e3) until = Math.max(until, e);
  return until > now ? { configured: true, state: 'busy', until: new Date(until).toISOString() } : { configured: true, state: 'free' };
}

module.exports = async function handler(req, res) {
  const url = process.env.GOOGLE_ICS_URL;
  res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=240');
  if (!url) return res.status(200).json({ configured: false });
  const now = Date.now();
  if (!inHours(now)) return res.status(200).json(status({}, now)); // no need to read the calendar at night
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error('ics ' + r.status);
    return res.status(200).json(status(ical.sync.parseICS(await r.text()), now));
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ configured: true, error: 'Calendar did not answer' });
  }
};
module.exports.status = status; // for tests
