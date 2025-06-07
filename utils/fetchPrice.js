const axios = require('axios');

const priceCache = new Map();

const resolveSymbol = (symbol) => {
  const upper = symbol.toUpperCase();
  return upper;
};

const fetchPrice = async (symbol) => {
  const resolved = resolveSymbol(symbol.trim());
  const cached = priceCache.get(resolved);
  const now = Date.now();

  if (cached && now - cached.timestamp < 300000) {
    console.log(`💾 [Cache HIT] Price for ${resolved} served from cache`);
    return cached.price;
  }

  console.log(`🚀 [Cache MISS] Fetching price for ${resolved} from Twelve Data`);

  try {
    const url = `https://api.twelvedata.com/price?symbol=${resolved}&apikey=${process.env.TWELVE_API_KEY}`;
    const response = await axios.get(url);

    if (response.data.status === 'error') {
      throw new Error(response.data.message || 'API error');
    }

    const price = parseFloat(response.data.price);

    if (isNaN(price)) {
      throw new Error('Invalid price value received');
    }

    const rounded = Number(price.toFixed(2));
    priceCache.set(resolved, { price: rounded, timestamp: now });
    return rounded;
  } catch (err) {
    console.error(`[fetchPrice] ❌ Failed to fetch price for ${resolved}:`, err.message);
    return 0;
  }
};

module.exports = fetchPrice;
