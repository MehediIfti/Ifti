// Dhaka's weather for the line under my name: GET /api/weather
// From Open-Meteo (free, no key, no cookies). Fetched here rather than in the page so visitors' browsers never call a
// third party, and cached for 30 minutes so Open-Meteo sees about two requests an hour whatever the traffic.
const URL = 'https://api.open-meteo.com/v1/forecast?latitude=23.81&longitude=90.41&current=temperature_2m,weather_code,is_day&timezone=Asia%2FDhaka';

// WMO weather codes in one or two plain words.
function sky(code, day) {
  if (code === 0) return day ? 'clear' : 'clear night';
  if (code === 1) return 'mostly clear';
  if (code === 2) return 'partly cloudy';
  if (code === 3) return 'overcast';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 95) return 'thunderstorms';
  return '';
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
  try {
    const r = await fetch(URL);
    if (!r.ok) throw new Error('open-meteo ' + r.status);
    const c = (await r.json()).current;
    return res.status(200).json({ temp: Math.round(c.temperature_2m), sky: sky(c.weather_code, c.is_day === 1) });
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'Weather did not answer' });
  }
};
