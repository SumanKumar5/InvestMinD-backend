const axios = require('axios');

const fxCache = new Map();
const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours

const getExchangeRate = async (from, to) => {
  const key = `${from}_${to}`;
  const cached = fxCache.get(key);
  const now = Date.now();

  // Serve from cache if fresh
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.rate;
  }

  try {
    const response = await axios.get('https://api.currencyapi.com/v3/latest', {
      params: {
        apikey: process.env.CURRENCY_API_KEY, // store your key in .env
        base_currency: from,
        currencies: to
      }
    });

    const rate = response.data.data[to]?.value;
    if (!rate) throw new Error('Invalid FX data');

    fxCache.set(key, { rate, timestamp: now });
    return rate;
  } catch (err) {
    console.error(`[FX] ❌ Failed to fetch ${from}→${to} rate:`, err.message);
    return 1; // fallback (so value stays unchanged)
  }
};

module.exports = getExchangeRate;
