// Meetings per day for the Activity heatmap on the homepage: GET /api/activity
// The last 18 weeks, Sunday to today, on Dhaka days, plus `since`: the first day the calendar link fully covers (earlier
// days come from the hand-kept ACTIVITY block in the page). Counts only: no titles, no names, nothing else leaves here.
// What counts as a meeting is decided in _calendar.js (all-day, marked Free, cancelled and declined events don't count).
const { readCalendar, meetings } = require('./_calendar');

const DHAKA = 6 * 3600e3, WEEKS = 18;

function counts(data, now) {
  const d = new Date(now + DHAKA); // read on a Dhaka clock with the UTC getters
  const today = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - DHAKA; // Dhaka midnight, as UTC ms
  const from = today - (d.getUTCDay() + (WEEKS - 1) * 7) * 864e5; // the Sunday 17 weeks before this week's Sunday
  const days = Math.round((today - from) / 864e5) + 1, c = new Array(days).fill(0);
  for (const [s] of meetings(data, from, today + 864e5)) {
    const i = Math.floor((s - from) / 864e5);
    if (i >= 0 && i < days) c[i]++;
  }
  // Google's link only reaches back so far, so say from which day the counts are complete: the day after the first event.
  let first = Infinity;
  for (const ev of Object.values(data)) if (ev.type === 'VEVENT') for (const x of [ev].concat(Object.values(ev.recurrences || {}))) if (x && x.start && +x.start < first) first = +x.start;
  const fd = new Date((isFinite(first) ? first : from) + DHAKA), since = Date.UTC(fd.getUTCFullYear(), fd.getUTCMonth(), fd.getUTCDate() + 1);
  return { from: new Date(from + DHAKA).toISOString().slice(0, 10), since: new Date(since).toISOString().slice(0, 10), counts: c };
}

module.exports = async function handler(req, res) {
  const url = process.env.GOOGLE_ICS_URL;
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  if (!url) return res.status(200).json({ configured: false });
  try {
    return res.status(200).json(Object.assign({ configured: true }, counts(await readCalendar(url), Date.now())));
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    console.error('activity', e);
    return res.status(502).json({ configured: true, error: 'Calendar did not answer' });
  }
};
module.exports.counts = counts; // for tests
