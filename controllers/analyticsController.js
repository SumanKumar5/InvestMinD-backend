const Portfolio = require("../models/Portfolio");
const Holding = require("../models/Holding");
const fetchPrice = require("../utils/fetchPrice");

// GET /api/analytics/:id
exports.getAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const portfolio = await Portfolio.findById(id);
    if (!portfolio || portfolio.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized or portfolio not found" });
    }

    const holdings = await Holding.find({ portfolio: id });
    if (!holdings.length) {
      return res.json({
        CAGR: 0,
        totalInvestment: 0,
        currentValue: 0,
        profitLossPercentage: 0
      });
    }

    let totalInvested = 0;
    let currentValue = 0;

    for (const h of holdings) {
      const invested = h.quantity * h.avgBuyPrice;
      const price = await fetchPrice(h.symbol);
      const current = h.quantity * price;

      totalInvested += invested;
      currentValue += current;
    }

    const rawYears =
      (Date.now() - new Date(portfolio.createdAt)) /
      (1000 * 60 * 60 * 24 * 365);
    const years = rawYears < 0.08 ? 0.08 : rawYears;

    const CAGR = ((currentValue / totalInvested) ** (1 / years) - 1) * 100;
    const profitLossPercent = ((currentValue - totalInvested) / totalInvested) * 100;

    res.json({
      totalInvestment: Number(totalInvested.toFixed(2)),
      currentValue: Number(currentValue.toFixed(2)),
      profitLossPercentage: Number(profitLossPercent.toFixed(2)),
      CAGR: Number(CAGR.toFixed(2))
    });
  } catch (err) {
    console.error("❌ Analytics error:", err.message);
    res.status(500).json({ message: "Error generating analytics" });
  }
};

// GET /api/analytics/:id/stocks
exports.getStockDistribution = async (req, res) => {
  try {
    const { id } = req.params;
    const portfolio = await Portfolio.findById(id);

    if (!portfolio || portfolio.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized or portfolio not found" });
    }

    const holdings = await Holding.find({ portfolio: id });

    let totalValue = 0;
    const stockData = [];

    for (const h of holdings) {
      const price = await fetchPrice(h.symbol);
      const value = h.quantity * price;
      totalValue += value;

      stockData.push({
        symbol: h.symbol,
        companyName: h.companyName || h.symbol, 
        marketValue: value
      });
    }

    const distribution = stockData.map((stock) => ({
      symbol: stock.symbol,
      companyName: stock.companyName,
      marketValue: Number(stock.marketValue.toFixed(2)),
      percentage: Number(((stock.marketValue / totalValue) * 100).toFixed(2))
    }));

    res.json(distribution);
  } catch (err) {
    console.error("❌ Stock Distribution error:", err.message);
    res.status(500).json({ message: "Error generating stock distribution" });
  }
};

// GET /api/analytics/:id/best-worst
exports.getBestWorstPerformers = async (req, res) => {
  try {
    const { id } = req.params;

    const portfolio = await Portfolio.findById(id);
    if (!portfolio || portfolio.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized or portfolio not found" });
    }

    const holdings = await Holding.find({ portfolio: id });

    if (!holdings.length) {
      return res.json({ best: null, worst: null });
    }

    const results = [];

    for (const h of holdings) {
      const price = await fetchPrice(h.symbol);
      const gain = (price - h.avgBuyPrice) * h.quantity;
      const percent = ((price - h.avgBuyPrice) / h.avgBuyPrice) * 100;

      results.push({
        symbol: h.symbol,
        companyName: h.companyName,
        gain: parseFloat(gain.toFixed(2)),
        percent: parseFloat(percent.toFixed(2))
      });
    }

    const best = results.reduce((a, b) => (a.percent > b.percent ? a : b));
    const worst = results.reduce((a, b) => (a.percent < b.percent ? a : b));

    res.json({ best, worst });
  } catch (err) {
    console.error("❌ Best/Worst error:", err.message);
    res.status(500).json({ message: "Error fetching best/worst performers" });
  }
};
