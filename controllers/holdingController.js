const Holding = require('../models/Holding');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const axios = require('axios');
const getLivePrice = require('../utils/fetchPrice');
const Snapshot = require('../models/Snapshot');

// POST /portfolios/:id/holdings
exports.addHolding = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio || portfolio.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized or portfolio not found' });
    }

    const { symbol, quantity, avgBuyPrice, currency, notes, type = 'buy' } = req.body;
    const numericQuantity = Number(quantity);
    const numericAvgBuyPrice = Number(avgBuyPrice);

    if (!['buy', 'sell'].includes(type) || numericQuantity <= 0 || numericAvgBuyPrice <= 0) {
      return res.status(400).json({ message: 'Invalid data' });
    }

    let holding = await Holding.findOne({ portfolio: portfolio._id, symbol });

    if (holding) {
      if (type === 'buy') {
        const totalQty = holding.quantity + numericQuantity;
        const newAvgPrice = ((holding.avgBuyPrice * holding.quantity) + (numericAvgBuyPrice * numericQuantity)) / totalQty;

        holding.quantity = totalQty;
        holding.avgBuyPrice = Number(newAvgPrice.toFixed(2));
        if (currency) holding.currency = currency;
        if (notes) holding.notes = notes;
        await holding.save();

        await Transaction.create({
          holding: holding._id,
          type: 'buy',
          quantity: numericQuantity,
          price: numericAvgBuyPrice,
          notes
        });

        const allHoldings = await Holding.find({ portfolio: portfolio._id });
        let totalValue = 0;
        for (const h of allHoldings) {
          const livePrice = await getLivePrice(h.symbol);
          totalValue += h.quantity * livePrice;
        }

        await Snapshot.create({
          portfolioId: portfolio._id,
          totalValue,
          timestamp: new Date()
        });

        return res.status(200).json(holding);
      }

      if (type === 'sell') {
        if (numericQuantity > holding.quantity) {
          return res.status(400).json({ message: 'Sell quantity exceeds available holdings' });
        }

        holding.quantity -= numericQuantity;

        await Transaction.create({
          holding: holding._id,
          type: 'sell',
          quantity: numericQuantity,
          price: numericAvgBuyPrice,
          notes
        });

        if (holding.quantity === 0) {
          await holding.deleteOne();
          return res.status(200).json({ message: `All ${symbol} sold. Holding deleted.` });
        }

        await holding.save();
        return res.status(200).json(holding);
      }

    } else {
      if (type === 'sell') {
        return res.status(400).json({ message: `You don't own any ${symbol} to sell.` });
      }

      // New holding creation: fetch and store company name
      let companyName = symbol;
      try {
        const tdRes = await axios.get(
          `https://api.twelvedata.com/stocks?symbol=${symbol}&apikey=${process.env.TWELVE_API_KEY}`
        );
        companyName = tdRes.data?.data?.[0]?.name || symbol;
      } catch (err) {
        console.warn(`⚠️ Company name fetch failed for ${symbol}`);
      }

      holding = await Holding.create({
        portfolio: portfolio._id,
        symbol,
        quantity: numericQuantity,
        avgBuyPrice: numericAvgBuyPrice,
        currency,
        notes,
        companyName 
      });

      await Transaction.create({
        holding: holding._id,
        type: 'buy',
        quantity: numericQuantity,
        price: numericAvgBuyPrice,
        notes
      });

      const allHoldings = await Holding.find({ portfolio: portfolio._id });
      let totalValue = 0;
      for (const h of allHoldings) {
        const livePrice = await getLivePrice(h.symbol);
        totalValue += h.quantity * livePrice;
      }

      await Snapshot.create({
        portfolioId: portfolio._id,
        totalValue,
        timestamp: new Date()
      });

      return res.status(201).json(holding);
    }

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
        const numericQuantity = Number(h.quantity);
        const numericAvgBuyPrice = Number(h.avgBuyPrice);
        const currentPrice = await getLivePrice(h.symbol);

        const marketValue = Number((numericQuantity * currentPrice).toFixed(2));
        const gainLoss = Number(((currentPrice - numericAvgBuyPrice) * numericQuantity).toFixed(2));
        const gainLossPercent = Number((((currentPrice - numericAvgBuyPrice) / numericAvgBuyPrice) * 100).toFixed(2));

        return {
          _id: h._id,
          symbol: h.symbol,
          companyName: h.companyName || h.symbol, // ✅ read from DB
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

// GET /api/holdings/:holdingId
exports.getHoldingDetails = async (req, res) => {
  try {
    const holding = await Holding.findById(req.params.id).populate('portfolio');

    if (!holding || holding.portfolio.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized or holding not found' });
    }

    const currentPrice = await getLivePrice(holding.symbol);

    res.json({
      _id: holding._id,
      symbol: holding.symbol,
      companyName: holding.companyName || holding.symbol, // ✅ read from DB
      currentPrice,
      quantity: holding.quantity,
      avgBuyPrice: holding.avgBuyPrice,
      notes: holding.notes || null
    });
  } catch (err) {
    console.error('❌ Get Holding Details Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
