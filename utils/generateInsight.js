const OpenAI = require("openai");

const insightCache = new Map();

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

const generateInsight = async (formattedPortfolioString) => {
  const cacheKey = formattedPortfolioString;
  const now = Date.now();

  const cached = insightCache.get(cacheKey);
  if (cached && now - cached.timestamp < 10 * 60 * 1000) {
    console.log(`[Cache HIT] Portfolio insight from cache`);
    return cached.insight;
  }

  console.log(
    `[Cache MISS] Calling NVIDIA NIM (LLaMA 3.3 70B) for portfolio insight`,
  );

  const prompt = `Analyze this user portfolio and give a financial insight in simple terms (200 words max).
Make the output motivational, insightful, and suggest if diversification or sector focus is needed.

Data:
${formattedPortfolioString}`;

  try {
    const response = await client.chat.completions.create({
      model: "meta/llama-3.3-70b-instruct",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 512,
    });

    const insight =
      response.choices?.[0]?.message?.content || "No insight available.";
    insightCache.set(cacheKey, { insight, timestamp: now });

    return insight;
  } catch (err) {
    console.error(`[generateInsight] NVIDIA NIM Error:`, err.message);
    return "Failed to generate insight at this time. Please try again later.";
  }
};

module.exports = generateInsight;
