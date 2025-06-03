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
    // Ensure numeric values are numbers
    const numericQuantity = Number(quantity);
    const numericAvgBuyPrice = Number(avgBuyPrice);

    // 🔄 Check for existing holding
    const existing = await Holding.findOne({ portfolio: portfolio._id, symbol });

    if (existing) {
      const totalQty = Number(existing.quantity) + numericQuantity;
      const newAvgPrice =
        ((existing.avgBuyPrice * existing.quantity) + (numericAvgBuyPrice * numericQuantity)) / totalQty;

      existing.quantity = totalQty;
      existing.avgBuyPrice = newAvgPrice;
      if (currency) existing.currency = currency;
      if (notes) existing.notes = notes;

      await existing.save();
      return res.status(200).json(existing);
    }

    // Create new holding if it doesn't exist
    const holding = await Holding.create({
      portfolio: portfolio._id,
      symbol,
      quantity: numericQuantity,
      avgBuyPrice: numericAvgBuyPrice,
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
        // Ensure stored values are used as numbers
        const numericQuantity = Number(h.quantity);
        const numericAvgBuyPrice = Number(h.avgBuyPrice);

        const currentPrice = await getLivePrice(h.symbol);
        let companyName = h.symbol;
        try {
          const tdRes = await axios.get(
            `https://api.twelvedata.com/stocks?symbol=${h.symbol}&apikey=${process.env.TWELVE_API_KEY}`
          );
          companyName = tdRes.data?.data?.[0]?.name || h.symbol;
        } catch (e) {
          console.warn(`⚠️ Company name fetch failed for ${h.symbol}`);
        }

        // Calculate with numeric conversions and round using toFixed, then convert back to number
        const marketValue = Number((numericQuantity * currentPrice).toFixed(2));
        const gainLoss = Number(((currentPrice - numericAvgBuyPrice) * numericQuantity).toFixed(2));
        const gainLossPercent = Number((((currentPrice - numericAvgBuyPrice) / numericAvgBuyPrice) * 100).toFixed(2));

        return {
          _id: h._id,
          symbol: h.symbol,
          companyName,
          quantity: numericQuantity,
          avgBuyPrice: numericAvgBuyPrice,
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
