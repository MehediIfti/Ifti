// Am I free right now? For the status under my name on every page: GET /api/status
// Reads my work calendar through its secret iCal address (GOOGLE_ICS_URL in Vercel; README → Calendar status) and
// answers only free or busy-until. Meeting titles and details never leave this function.
const ical = require('node-ical');

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
  // No working hours: free whenever the calendar is. Join back-to-back meetings so "free at" is when I'm actually free.
  let until = 0;
  for (const [s, e] of busyBlocks(data, now)) if (s <= Math.max(now, until) + 60e3) until = Math.max(until, e);
  return until > now ? { configured: true, state: 'busy', until: new Date(until).toISOString() } : { configured: true, state: 'free' };
}

module.exports = async function handler(req, res) {
  const url = process.env.GOOGLE_ICS_URL;
  res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=240');
  if (!url) return res.status(200).json({ configured: false });
  const now = Date.now();
  let step = 'fetch';
  try {
    const r = await fetch(url.trim());
    if (!r.ok) throw new Error('Google answered ' + r.status + (r.status === 404 ? ': check it is the Secret address, not the Public one' : ''));
    const text = await r.text();
    if (!/^\s*BEGIN:VCALENDAR/.test(text)) throw new Error('the link did not return a calendar file');
    step = 'parse'; const data = ical.sync.parseICS(text);
    step = 'status'; return res.status(200).json(status(data, now));
  } catch (e) {
    // Say what went wrong without echoing the link or any calendar content.
    res.setHeader('Cache-Control', 'no-store');
    const why = step === 'fetch' ? String(e.message || e).replace(/https?:\/\/\S+/g, '[link]').slice(0, 160) : 'could not ' + step + ' the calendar (' + (e.name || 'Error') + ')';
    console.error('status', step, e);
    return res.status(502).json({ configured: true, error: 'Calendar did not answer', why });
  }
};
module.exports.status = status; // for tests
