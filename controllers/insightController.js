const Portfolio = require('../models/Portfolio');
const Holding = require('../models/Holding');
const fetchPrice = require('../utils/fetchPrice');
const generateInsight = require('../utils/generateInsight');

/**
 * @route   GET /api/insight
 * @access  Private (Requires Auth)
 * @desc    Generate Gemini AI insight for all portfolios of the logged-in user.
 *          Loops over each portfolio and its holdings, calculates gains, and sends formatted summary to Gemini.
 *          Returns a combined AI insight for the user's full investment landscape.
 */
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

/**
 * @route   GET /api/insight/:portfolioId
 * @access  Private (Requires Auth)
 * @desc    Generate Gemini AI insight for a specific portfolio of the logged-in user.
 *          Fetches holdings of the given portfolio, calculates gains, and sends a formatted prompt to Gemini.
 *          Returns AI insight focused only on the selected portfolio.
 */
exports.getInsightForPortfolio = async (req, res) => {
  try {
    const { portfolioId } = req.params;

    const portfolio = await Portfolio.findOne({
      _id: portfolioId,
      user: req.user._id,
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const holdings = await Holding.find({ portfolio: portfolioId });
    if (holdings.length === 0) {
      return res.status(400).json({ message: 'No holdings found in this portfolio' });
    }

    let formatted = `Portfolio: ${portfolio.name} (${portfolio.type})\n`;

    for (const h of holdings) {
      const livePrice = await fetchPrice(h.symbol);
      const gain = ((livePrice - h.avgBuyPrice) * h.quantity).toFixed(2);

      formatted += `  - ${h.symbol}: Qty=${h.quantity}, Avg=${h.avgBuyPrice}, Price=${livePrice}, Gain=${gain}\n`;
    }

    const insight = await generateInsight(formatted);
    res.json({ insight });

  } catch (err) {
    console.error('❌ Portfolio Insight Error:', err.message);
    if (err.response) {
      console.error('📄 Gemini Response:', err.response.data);
    }
    res.status(500).json({ message: 'AI insight generation failed' });
  }
};
