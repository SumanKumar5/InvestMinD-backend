const Portfolio = require('../models/Portfolio');
const Holding = require('../models/Holding');
const fetchPrice = require('../utils/fetchPrice');

// GET /portfolios
exports.getPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ user: req.user._id });
    res.json(portfolios);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /portfolios
exports.createPortfolio = async (req, res) => {
  try {
    const { name, type } = req.body;

    const portfolio = await Portfolio.create({
      user: req.user._id,
      name,
      type
    });

    res.status(201).json(portfolio);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data' });
  }
};

// DELETE /portfolios/:id
exports.deletePortfolio = async (req, res) => {
    try {
      const portfolio = await Portfolio.findById(req.params.id);
  
      if (!portfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }
  
      // Convert to string for accurate comparison
      const portfolioUserId = portfolio.user.toString();
      const loggedInUserId = req.user._id.toString();
  
      if (portfolioUserId !== loggedInUserId) {
        return res.status(403).json({ message: 'Not authorized to delete this portfolio' });
      }
  
      await Portfolio.findByIdAndDelete(req.params.id);
      res.json({ message: 'Portfolio deleted successfully' });
  
    } catch (err) {
      console.error('❌ Error deleting portfolio:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  exports.getPortfolioStats = async (req, res) => {
  try {
    const portfolioId = req.params.id;

    // Step 1: Validate ownership
    const portfolio = await Portfolio.findById(portfolioId);
    if (!portfolio || portfolio.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized or portfolio not found' });
    }

    const holdings = await Holding.find({ portfolio: portfolioId });

    let totalInvested = 0;
    let currentValue = 0;

    for (const h of holdings) {
      const livePrice = await fetchPrice(h.symbol);
      totalInvested += h.quantity * h.avgBuyPrice;
      currentValue += h.quantity * livePrice;
    }

    const profitLoss = currentValue - totalInvested;
    const profitLossPercent = (profitLoss / totalInvested) * 100;

    res.json({
      portfolioId,
      totalInvested: totalInvested.toFixed(2),
      currentValue: currentValue.toFixed(2),
      profitLoss: profitLoss.toFixed(2),
      profitLossPercent: profitLossPercent.toFixed(2)
    });

  } catch (err) {
    console.error('❌ Portfolio stats error:', err.message);
    res.status(500).json({ message: 'Error calculating portfolio stats' });
  }
};
