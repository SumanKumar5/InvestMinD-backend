const Transaction = require('../models/Transaction');
const Holding = require('../models/Holding');

// POST /holdings/:id/transactions
exports.addTransaction = async (req, res) => {
  try {
    const holding = await Holding.findById(req.params.id).populate('portfolio');

    // Auth check
    if (!holding || holding.portfolio.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized or holding not found' });
    }

    const { type, quantity, price } = req.body;

    // Validate input
    if (!['buy', 'sell'].includes(type) || quantity <= 0 || price <= 0) {
      return res.status(400).json({ message: 'Invalid transaction data' });
    }

    // Create transaction
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
      holding.avgBuyPrice = parseFloat(newAvgPrice.toFixed(2));
      await holding.save();
    }

    res.status(201).json({
      message: 'Transaction added successfully',
      transaction,
      updatedHolding: holding
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
    res.json(transactions);

  } catch (err) {
    console.error('❌ Get Transactions Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
