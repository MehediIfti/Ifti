// Am I free right now? For the status under my name on every page: GET /api/status
// Reads my work calendar through its secret iCal address (GOOGLE_ICS_URL in Vercel; README → Calendar status) and
// answers only free or busy-until. Meeting titles and details never leave this function.
const { readCalendar, meetings } = require('./_calendar');

function status(data, now) {
  // No working hours: free whenever the calendar is. Join back-to-back meetings so "free at" is when I'm actually free.
  let until = 0;
  for (const [s, e] of meetings(data, now - 864e5, now + 12 * 36e5)) if (e > now && s <= Math.max(now, until) + 60e3) until = Math.max(until, e);
  return until > now ? { configured: true, state: 'busy', until: new Date(until).toISOString() } : { configured: true, state: 'free' };
}

module.exports = async function handler(req, res) {
  const url = process.env.GOOGLE_ICS_URL;
  res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=240');
  if (!url) return res.status(200).json({ configured: false });
  const now = Date.now();
  let step = 'fetch';
  try {
    const data = await readCalendar(url);
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
