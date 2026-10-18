// Shared by api/status.js and api/activity.js: read my work calendar from its secret iCal link and say what counts as
// a meeting. Vercel doesn't turn files starting with _ into endpoints, so this is only ever used by those two.
const ical = require('node-ical');

async function readCalendar(url) {
  const r = await fetch(url.trim());
  if (!r.ok) throw new Error('Google answered ' + r.status + (r.status === 404 ? ': check it is the Secret address, not the Public one' : ''));
  const text = await r.text();
  if (!/^\s*BEGIN:VCALENDAR/.test(text)) throw new Error('the link did not return a calendar file');
  try { return ical.sync.parseICS(text); } catch (e) { throw new Error('could not parse the calendar'); } // never echo its content
}

// Does this event block my time? Not if it's marked Free, cancelled, or one I declined. (All-day events are skipped below.)
function blocks(ev, me) {
  if (ev.status === 'CANCELLED' || ev.transparency === 'TRANSPARENT') return false;
  const people = [].concat(ev.attendee || []);
  return !people.some(a => a && a.params && a.params.PARTSTAT === 'DECLINED' && String(a.val || '').toLowerCase().endsWith(me));
}

// Every meeting overlapping [from, to], as [start, end] in ms, sorted by start. Repeating meetings are expanded,
// with moved and cancelled dates applied.
function meetings(data, from, to) {
  const cal = Object.values(data).find(x => x.type === 'VCALENDAR') || {};
  const me = String(cal['WR-CALNAME'] || '').toLowerCase(); // Google names a calendar after its owner's email
  const out = [];
  for (const ev of Object.values(data)) {
    if (ev.type !== 'VEVENT' || !ev.start) continue;
    let list;
    try { list = ical.expandRecurringEvent(ev, { from: new Date(from), to: new Date(to), expandOngoing: true }); } catch (e) { continue; }
    for (const x of list) {
      if (x.isFullDay || !blocks(x.event || ev, me)) continue;
      const s = +x.start, e = +x.end;
      if (e > from && s < to) out.push([s, e]);
    }
  }
  return out.sort((a, b) => a[0] - b[0]);
}

module.exports = { readCalendar, meetings };
