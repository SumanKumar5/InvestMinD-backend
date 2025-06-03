const fetchPrice = require('../utils/fetchPrice');
const axios = require('axios');
const Holding = require('../models/Holding');
const Portfolio = require('../models/Portfolio');

const aiCache = new Map();

// GET /api/ai/insight/:portfolioId/:symbol
exports.getSmartAssetInsight = async (req, res) => {
  try {
    const { portfolioId, symbol } = req.params;
    const userId = req.user._id;

    const portfolio = await Portfolio.findById(portfolioId);
    if (!portfolio || portfolio.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized or portfolio not found' });
    }

    const holding = await Holding.findOne({ portfolio: portfolioId, symbol });
    if (!holding) {
      return res.status(404).json({ message: 'Holding not found' });
    }

    const quantity = Number(holding.quantity);
    const avgBuyPrice = Number(holding.avgBuyPrice);
    const cacheKey = `${symbol}_${quantity}_${avgBuyPrice}`;
    const now = Date.now();

    const cached = aiCache.get(cacheKey);
    if (cached && now - cached.timestamp < 10 * 60 * 1000) {
      console.log(`💾 [Cache HIT] Gemini smart insight for ${cacheKey}`);
      return res.json({
        symbol: symbol.toUpperCase(),
        quantity,
        avgBuyPrice,
        livePrice: cached.livePrice,
        insight: cached.insight
      });
    }

    console.log(`🚀 [Cache MISS] Calling Gemini API for ${cacheKey}`);
    const livePrice = Number(await fetchPrice(symbol));

    const prompt = `
Provide a concise investment summary (under 200 words) for:
- Asset: ${symbol}
- Quantity: ${quantity}
- Avg Buy Price: $${avgBuyPrice.toFixed(2)}
- Live Market Price: $${livePrice.toFixed(2)}

Discuss current profit/loss, company or crypto health, and suggest if it's good to hold, sell, or monitor further.
Keep it practical and beginner-friendly.
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const candidates = response.data?.candidates;
    if (!candidates || !candidates.length) {
      throw new Error('No response from Gemini');
    }

    const insight = candidates[0].content.parts[0].text;
    aiCache.set(cacheKey, { insight, livePrice, timestamp: now });

    res.json({
      symbol: symbol.toUpperCase(),
      quantity,
      avgBuyPrice,
      livePrice,
      insight
    });
  } catch (err) {
    console.error('❌ Smart AI Insight Error:', err.message);
    res.status(500).json({ message: 'Failed to generate smart asset insight' });
  }
};
