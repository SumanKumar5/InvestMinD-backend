const Portfolio = require('../models/Portfolio');
const Holding = require('../models/Holding');
const fetchPrice = require('../utils/fetchPrice');
const generateInsight = require('../utils/generateInsight');

exports.getInsight = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ user: req.user._id });
    let formatted = '';

    for (const p of portfolios) {
      formatted += `Portfolio: ${p.name} (${p.type})\n`;

      const holdings = await Holding.find({ portfolio: p._id });
      for (const h of holdings) {
        const livePrice = await fetchPrice(h.symbol);
        const gain = ((livePrice - h.avgBuyPrice) * h.quantity).toFixed(2);

        formatted += `  - ${h.symbol}: Qty=${h.quantity}, Avg=${h.avgBuyPrice}, Price=${livePrice}, Gain=${gain}\n`;
      }
    }

    const insight = await generateInsight(formatted);
    res.json({ insight });
} catch (err) {
  console.error('❌ Insight error:', err.message);
  if (err.response) {
    console.error('📄 Gemini Response:', err.response.data);
  }
  res.status(500).json({ message: 'AI insight generation failed' });
}
};
