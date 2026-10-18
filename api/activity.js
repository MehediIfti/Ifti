// Meetings per day for the Activity heatmap on the homepage: GET /api/activity
// The last 18 weeks, Sunday to today, on Dhaka days. Counts only: no titles, no names, nothing else leaves this function.
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
  return { from: new Date(from + DHAKA).toISOString().slice(0, 10), counts: c };
}

// TEMPORARY diagnostic: counts and rule shapes only, never titles, people or descriptions.
function diag(data) {
  const ical = require('node-ical');
  const evs = Object.values(data).filter(x => x.type === 'VEVENT');
  const from = new Date(Date.parse('2026-10-11T00:00:00+06:00')), to = new Date(Date.parse('2026-10-17T00:00:00+06:00'));
  const starts = evs.filter(e => e.start).map(e => +e.start).sort((a, b) => a - b);
  const rec = evs.filter(e => e.rrule), out = { events: evs.length, recurring: rec.length, withRecurrences: evs.filter(e => e.recurrences).length,
    firstStart: starts.length ? new Date(starts[0]).toISOString() : null, lastStart: starts.length ? new Date(starts[starts.length - 1]).toISOString() : null,
    byMonth: {}, recurringInWeek: [] };
  for (const t of starts) { const k = new Date(t).toISOString().slice(0, 7); out.byMonth[k] = (out.byMonth[k] || 0) + 1; }
  for (const e of rec) {
    let n, err = null; try { n = ical.expandRecurringEvent(e, { from, to, expandOngoing: true }).length; } catch (x) { err = String(x && x.message || x).slice(0, 120); }
    const rule = String(e.rrule && (e.rrule.toString ? e.rrule.toString() : e.rrule)).replace(/UNTIL=[^;\n]+/, 'UNTIL=…').replace(/DTSTART[^\n]*\n?/, '');
    if (err || n === 0 && /WEEKLY|DAILY/.test(rule)) out.recurringInWeek.push({ rule: rule.slice(0, 90), start: e.start && new Date(+e.start).toISOString(), tz: e.start && e.start.tz || null, n, err, status: e.status || null, transp: e.transparency || null });
  }
  out.recurringInWeek = out.recurringInWeek.slice(0, 25);
  out.node = process.version;
  out.seriesFields = evs.filter(e => e.recurrences).map(e => ({ keys: Object.keys(e).sort().join(','), rruleType: typeof e.rrule, overrides: Object.keys(e.recurrences).length }));
  try { out.rruleLib = typeof require('rrule-temporal'); } catch (x) { out.rruleLib = 'load failed: ' + String(x.message).slice(0, 100); }
  return out;
}

module.exports = async function handler(req, res) {
  const url = process.env.GOOGLE_ICS_URL;
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  if (!url) return res.status(200).json({ configured: false });
  try {
    const data = await readCalendar(url);
    if (req.query && req.query.diag === '1') { res.setHeader('Cache-Control', 'no-store'); return res.status(200).json(diag(data)); } // TEMPORARY: numbers only
    return res.status(200).json(Object.assign({ configured: true }, counts(data, Date.now())));
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    console.error('activity', e);
    return res.status(502).json({ configured: true, error: 'Calendar did not answer' });
  }
};
module.exports.counts = counts; // for tests
