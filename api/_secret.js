// Compares a value from the address bar with a secret without leaking, through timing, how much of it matched.
// Not an endpoint (starts with _). Used by the one-time Spotify setup pages.
const crypto = require('crypto');
module.exports = function same(given, secret) {
  if (typeof given !== 'string' || !secret) return false;
  const a = crypto.createHash('sha256').update(given).digest(), b = crypto.createHash('sha256').update(String(secret)).digest();
  return crypto.timingSafeEqual(a, b);
};
