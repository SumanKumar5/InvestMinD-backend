const fetchPrice = require('../utils/fetchPrice');
const axios = require('axios');

const aiCache = new Map();

exports.getAssetInsight = async (req, res) => {
  try {
    const { symbol, quantity, avgBuyPrice } = req.body;

    if (!symbol || !quantity || !avgBuyPrice) {
      return res.status(400).json({ message: 'Missing input values' });
    }

    const cacheKey = `${symbol}_${quantity}_${avgBuyPrice}`;
    const now = Date.now();

    const cached = aiCache.get(cacheKey);
    if (cached && now - cached.timestamp < 60000) { 
      console.log(`💾 [Cache HIT] Gemini insight for ${cacheKey}`);
      return res.json({ symbol: symbol.toUpperCase(), insight: cached.insight });
    }

    console.log(`🚀 [Cache MISS] Calling Gemini API for ${cacheKey}`);

    const livePrice = await fetchPrice(symbol);

    const prompt = `
Provide a concise investment summary (under 200 words) for:
- Asset: ${symbol}
- Quantity: ${quantity}
- Avg Buy Price: $${avgBuyPrice}
- Live Market Price: $${livePrice}

Discuss current profit/loss, company or crypto health, and suggest if it's good to hold, sell, or monitor further.
Keep it practical and beginner-friendly.
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const insight = response.data.candidates[0].content.parts[0].text;
    aiCache.set(cacheKey, { insight, timestamp: now });

    res.json({ symbol: symbol.toUpperCase(), insight });

  } catch (err) {
    console.error('❌ AI Insight Error:', err.message);
    res.status(500).json({ message: 'Failed to generate AI insight' });
  }
};