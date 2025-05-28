const Holding = require('../models/Holding');
const Portfolio = require('../models/Portfolio');

// POST /portfolios/:id/holdings
exports.addHolding = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio || portfolio.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized or portfolio not found' });
    }

    const { symbol, quantity, avgBuyPrice, currency, notes } = req.body;

    const holding = await Holding.create({
      portfolio: portfolio._id,
      symbol,
      quantity,
      avgBuyPrice,
      currency,
      notes
    });

    res.status(201).json(holding);
  } catch (err) {
    console.error('❌ Add Holding Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /portfolios/:id/holdings
exports.getHoldings = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio || portfolio.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized or portfolio not found' });
    }

    const holdings = await Holding.find({ portfolio: req.params.id });
    res.json(holdings);
  } catch (err) {
    console.error('❌ Get Holdings Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /holdings/:id
exports.deleteHolding = async (req, res) => {
  try {
    const holding = await Holding.findById(req.params.id).populate('portfolio');

    if (!holding || holding.portfolio.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized or holding not found' });
    }

    await holding.deleteOne();
    res.json({ message: 'Holding deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Holding Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
