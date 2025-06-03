const Transaction = require('../models/Transaction');
const Holding = require('../models/Holding');

// POST /holdings/:id/transactions
exports.addTransaction = async (req, res) => {
  try {
    const holding = await Holding.findById(req.params.id).populate('portfolio');

    if (!holding || holding.portfolio.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized or holding not found' });
    }

    // Parse numbers explicitly
    const type = req.body.type;
    const quantity = Number(req.body.quantity);
    const price = Number(req.body.price);

    if (!['buy', 'sell'].includes(type) || quantity <= 0 || price <= 0) {
      return res.status(400).json({ message: 'Invalid transaction data' });
    }

    const transaction = await Transaction.create({
      holding: holding._id,
      type,
      quantity,
      price
    });

    // Auto-update holding on BUY
    if (type === 'buy') {
      const totalQty = holding.quantity + quantity;

      const newAvgPrice =
        ((holding.quantity * holding.avgBuyPrice) + (quantity * price)) / totalQty;

      holding.quantity = totalQty;
      holding.avgBuyPrice = Number(newAvgPrice.toFixed(2)); // ensure it's numeric
      await holding.save();
    }

    res.status(201).json({
      message: 'Transaction added successfully',
      transaction,
      updatedHolding: {
        _id: holding._id,
        symbol: holding.symbol,
        quantity: holding.quantity,
        avgBuyPrice: Number(holding.avgBuyPrice), // ensure numeric
        currency: holding.currency,
        notes: holding.notes
      }
    });

  } catch (err) {
    console.error('❌ Add Transaction Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /holdings/:id/transactions
exports.getTransactions = async (req, res) => {
  try {
    const holding = await Holding.findById(req.params.id).populate('portfolio');

    if (!holding || holding.portfolio.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized or holding not found' });
    }

    const transactions = await Transaction.find({ holding: req.params.id }).sort({ executedAt: -1 });

    // Ensure quantity and price in response are numbers
    const safeTransactions = transactions.map((tx) => ({
      _id: tx._id,
      holding: tx.holding,
      type: tx.type,
      quantity: Number(tx.quantity),
      price: Number(tx.price),
      executedAt: tx.executedAt
    }));

    res.json(safeTransactions);

  } catch (err) {
    console.error('❌ Get Transactions Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
