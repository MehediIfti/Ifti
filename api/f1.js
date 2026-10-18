// Live F1 numbers for the F1 pop-up and the terminal's f1 command: GET /api/f1
// From the free Jolpica F1 API (the Ergast successor, no key). The page keeps hand-written fallbacks in F1 UPDATE,
// plus the things this API doesn't count the same way: titles, poles and the records list.
const J = 'https://api.jolpi.ca/ergast/f1';
const DRIVER = 'max_verstappen', TEAM = 'red_bull';

async function get(path) {
  const r = await fetch(J + path);
  if (!r.ok) throw new Error(path + ' ' + r.status);
  return (await r.json()).MRData;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

module.exports = async function handler(req, res) {
  // Numbers change once a race weekend, so Vercel keeps an answer for six hours and serves the old one while it refreshes.
  res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
  try {
    // A few at a time: the API allows about four requests a second.
    const [drivers, teams, last, next] = await Promise.all([
      get('/current/driverStandings.json'), get('/current/constructorStandings.json'),
      get('/current/last/results.json?limit=1'), get('/current/next.json')
    ]);
    await sleep(300);
    const [wins, p2, p3, starts] = await Promise.all([
      get(`/drivers/${DRIVER}/results/1.json?limit=1`), get(`/drivers/${DRIVER}/results/2.json?limit=1`),
      get(`/drivers/${DRIVER}/results/3.json?limit=1`), get(`/drivers/${DRIVER}/results.json?limit=1`)
    ]);
    await sleep(300);
    const latestWin = (await get(`/drivers/${DRIVER}/results/1.json?limit=1&offset=${Math.max(0, +wins.total - 1)}`)).RaceTable.Races[0];

    const ds = drivers.StandingsTable.StandingsLists[0].DriverStandings;
    const me = ds.find(d => d.Driver.driverId === DRIVER) || {};
    const ts = teams.StandingsTable.StandingsLists[0].ConstructorStandings;
    const team = ts.find(t => t.Constructor.constructorId === TEAM) || {};
    const lastRace = last.RaceTable.Races[0], nextRace = next.RaceTable.Races[0];
    return res.status(200).json({
      season: drivers.StandingsTable.season,
      asOf: lastRace ? lastRace.season + ' ' + lastRace.raceName : null,
      pos: me.position, pts: me.points,
      table: ds.slice(0, 5).map(d => [d.position, d.Driver.givenName.replace(/^Andrea /, '') + ' ' + d.Driver.familyName, d.Constructors[0].name, d.points]),
      teamPos: team.position, teamPts: team.points,
      wins: wins.total, podiums: String(+wins.total + +p2.total + +p3.total), starts: starts.total,
      latestWin: latestWin ? { race: latestWin.raceName, season: latestWin.season, date: latestWin.date, isLast: !!lastRace && latestWin.season === lastRace.season && latestWin.round === lastRace.round } : null,
      next: nextRace ? { race: nextRace.raceName, at: nextRace.date + 'T' + (nextRace.time || '12:00:00Z') } : null
    });
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'F1 data did not answer' });
  }
};
