const Holding = require('../models/Holding');
const Portfolio = require('../models/Portfolio');
const axios = require('axios');
const getLivePrice = require('../utils/fetchPrice');

// POST /portfolios/:id/holdings
exports.addHolding = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio || portfolio.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized or portfolio not found' });
    }

    const { symbol, quantity, avgBuyPrice, currency, notes } = req.body;

    // 🔄 Check for existing holding
    const existing = await Holding.findOne({ portfolio: portfolio._id, symbol });

    if (existing) {
      const totalQty = existing.quantity + quantity;
      const newAvgPrice =
        ((existing.avgBuyPrice * existing.quantity) + (avgBuyPrice * quantity)) / totalQty;

      existing.quantity = totalQty;
      existing.avgBuyPrice = newAvgPrice;
      if (currency) existing.currency = currency;
      if (notes) existing.notes = notes;

      await existing.save();
      return res.status(200).json(existing);
    }

    // Create new holding if not exists
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

// GET /portfolios/:id/summary
exports.getHoldingsSummary = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio || portfolio.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized or portfolio not found' });
    }

    const holdings = await Holding.find({ portfolio: req.params.id });

    const enrichedHoldings = await Promise.all(
      holdings.map(async (h) => {
        const currentPrice = await getLivePrice(h.symbol);

        let companyName = h.symbol;
        try {
          const tdRes = await axios.get(`https://api.twelvedata.com/stocks?symbol=${h.symbol}&apikey=${process.env.TWELVE_API_KEY}`);
          companyName = tdRes.data?.data?.[0]?.name || h.symbol;
        } catch (e) {
          console.warn(`⚠️ Company name fetch failed for ${h.symbol}`);
        }

        const marketValue = h.quantity * currentPrice;
        const gainLoss = (currentPrice - h.avgBuyPrice) * h.quantity;
        const gainLossPercent = ((currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100;

        return {
          _id: h._id,
          symbol: h.symbol,
          companyName,
          quantity: h.quantity,
          avgBuyPrice: h.avgBuyPrice,
          currentPrice,
          marketValue,
          gainLoss,
          gainLossPercent,
        };
      })
    );

    res.json(enrichedHoldings);
  } catch (err) {
    console.error('❌ Get Holdings Summary Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};