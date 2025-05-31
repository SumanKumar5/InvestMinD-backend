const axios = require('axios');

const priceCache = new Map();

const fetchPrice = async (symbol) => {
  const cached = priceCache.get(symbol);
  const now = Date.now();

  if (cached && now - cached.timestamp < 60000) {
    console.log(`💾 [Cache HIT] Price for ${symbol} served from cache`);
    return cached.price;
  }

  console.log(`🚀 [Cache MISS] Fetching price for ${symbol} from Twelve Data`);

  const url = `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${process.env.TWELVE_API_KEY}`;
  const response = await axios.get(url);

  if (response.data.status === 'error') {
    throw new Error(response.data.message || 'API error');
  }

  const price = parseFloat(response.data.price);
  priceCache.set(symbol, { price, timestamp: now });

  return price;
};

module.exports = fetchPrice;