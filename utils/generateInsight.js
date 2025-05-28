const axios = require('axios');

const generateInsight = async (formattedPortfolioString) => {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const prompt = `
Analyze this user portfolio and give a financial insight in simple terms (200 words max).
Output should be motivational and suggestive.

Data:
${formattedPortfolioString}
`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const res = await axios.post(endpoint, body, {
    headers: { 'Content-Type': 'application/json' }
  });

  return res.data.candidates[0].content.parts[0].text;
};

module.exports = generateInsight;
