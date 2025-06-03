const axios = require('axios');

const insightCache = new Map();

const generateInsight = async (formattedPortfolioString) => {
  const cacheKey = formattedPortfolioString;
  const now = Date.now();

  const cached = insightCache.get(cacheKey);
  if (cached && now - cached.timestamp < 10 * 60 * 1000) { // 10 mins
    console.log(`💾 [Cache HIT] Portfolio insight from cache`);
    return cached.insight;
  }

  console.log(`🚀 [Cache MISS] Calling Gemini API for portfolio insight`);

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const prompt = `
Analyze this user portfolio and give a financial insight in simple terms (200 words max).
Make the output motivational, insightful, and suggest if diversification or sector focus is needed.

Data:
${formattedPortfolioString}
`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  try {
    const res = await axios.post(endpoint, body, {
      headers: { 'Content-Type': 'application/json' }
    });

    const insight = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No insight available.';
    insightCache.set(cacheKey, { insight, timestamp: now });

    return insight;
  } catch (err) {
    console.error(`[generateInsight] ❌ Gemini API Error:`, err.message);
    return '⚠️ Failed to generate insight at this time. Please try again later.';
  }
};

module.exports = generateInsight;
