const Portfolio = require('../models/Portfolio');
const Holding = require('../models/Holding');
const fetchPrice = require('../utils/fetchPrice');

exports.getAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const portfolio = await Portfolio.findById(id);
    if (!portfolio || portfolio.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized or portfolio not found' });
    }

    const holdings = await Holding.find({ portfolio: id });
    if (!holdings.length) {
      return res.json({ CAGR: "0.00%", sectors: {} });
    }

    const symbolToSector = {
      AAPL: "Technology",
      TSLA: "Automobile",
      MSFT: "Technology",
      BTC: "Crypto",
      ETH: "Crypto",
      RELIANCE: "Energy",
      HDFCBANK: "Finance",
      TCS: "Technology"
    };

    let totalInvested = 0;
    let currentValue = 0;
    let sectorTotals = {};

    for (const h of holdings) {
      const invested = h.quantity * h.avgBuyPrice;
      const price = await fetchPrice(h.symbol);
      const current = h.quantity * price;

      totalInvested += invested;
      currentValue += current;

      const sector = symbolToSector[h.symbol.toUpperCase()] || "Other";
      sectorTotals[sector] = (sectorTotals[sector] || 0) + current;
    }

    // Calculate holding period in years (min: 0.08 ≈ 1 month)
    const rawYears = (Date.now() - new Date(portfolio.createdAt)) / (1000 * 60 * 60 * 24 * 365);
    const years = rawYears < 0.08 ? 0.08 : rawYears;

    const CAGR = (((currentValue / totalInvested) ** (1 / years)) - 1) * 100;

    // Sector % breakdown
    const sectors = {};
    for (const [sector, value] of Object.entries(sectorTotals)) {
      sectors[sector] = ((value / currentValue) * 100).toFixed(2);
    }

    res.json({
      CAGR: CAGR.toFixed(2) + "%",
      sectors
    });

  } catch (err) {
    console.error("❌ Analytics error:", err.message);
    res.status(500).json({ message: "Error generating analytics" });
  }
};
