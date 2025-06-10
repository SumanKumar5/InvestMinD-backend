const axios = require("axios");
require("dotenv").config();

const priceCache = new Map();
const fxCache = new Map();

const resolveSymbol = (symbol) => {
  return symbol.trim().toUpperCase();
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getExchangeRate = async (from, to) => {
  const key = `${from}_${to}`;
  const cached = fxCache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < 3 * 60 * 60 * 1000) {
    return cached.rate;
  }

  try {
    const response = await axios.get("https://api.currencyapi.com/v3/latest", {
      params: {
        apikey: process.env.CURRENCY_API_KEY,
        base_currency: from,
        currencies: to,
      },
    });

    const rate = response.data.data[to]?.value;
    if (!rate) throw new Error("Missing rate");

    fxCache.set(key, { rate, timestamp: now });
    return rate;
  } catch (err) {
    console.error(`[FX] ❌ Failed to fetch ${from}→${to}:`, err.message);
    return 1; // fallback to no conversion
  }
};

const fetchPrice = async (symbol) => {
  const resolved = resolveSymbol(symbol);
  const cached = priceCache.get(resolved);
  const now = Date.now();

  if (cached && now - cached.timestamp < 300000) {
    console.log(`💾 [Cache HIT] Price for ${resolved} served from cache`);
    return cached.price;
  }

  const rawBaseUrl = process.env.PRICE_SERVICE_URL || "http://localhost:5001";
  const baseUrl = rawBaseUrl.replace(/\/$/, "");
  const url = `${baseUrl}/price?symbol=${resolved}`;

  console.log(`🚀 [Cache MISS] Fetching price for ${resolved} from ${baseUrl}`);

  let attempt = 0;

  while (attempt < 3) {
    try {
      const response = await axios.get(url);
      let price = Number(response.data.price);

      if (resolved.endsWith(".BSE") || resolved.endsWith(".NS")) {
        const rate = await getExchangeRate("INR", "USD");
        price *= rate;
      }

      const rounded = Number(price.toFixed(2));
      priceCache.set(resolved, { price: rounded, timestamp: now });
      return rounded;
    } catch (err) {
      attempt++;
      console.warn(`[fetchPrice] Attempt ${attempt} failed for ${resolved}: ${err.message}`);

      // Stop retrying on 4xx client errors (e.g. invalid symbol)
      if (err.response && err.response.status >= 400 && err.response.status < 500) {
        break;
      }

      // Exponential backoff: 200ms → 400ms → 800ms
      await delay(200 * 2 ** (attempt - 1));
    }
  }

  // Final failure after retries
  const errorMessage = `Sorry, price for ${resolved} is not available right now. Try again later.`;
  console.error(`[fetchPrice] ❌ ${errorMessage}`);
  throw new Error(errorMessage);
};

module.exports = fetchPrice;
