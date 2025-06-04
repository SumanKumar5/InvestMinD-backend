const Transaction = require('../models/Transaction');
const Holding = require('../models/Holding');

// GET /api/transactions/holdings/:id
exports.getTransactions = async (req, res) => {
  try {
    const holding = await Holding.findById(req.params.id).populate('portfolio');

    if (!holding || holding.portfolio.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized or holding not found' });
    }

    const transactions = await Transaction.find({ holding: holding._id }).sort({ executedAt: -1 });

    // Append symbol to each transaction response
    const response = transactions.map((tx) => ({
      _id: tx._id,
      holding: tx.holding,
      type: tx.type,
      quantity: tx.quantity,
      price: tx.price,
      executedAt: tx.executedAt,
      notes: tx.notes,
      symbol: holding.symbol    // <-- add symbol here
    }));

    res.json(response);
  } catch (err) {
    console.error('❌ Transaction Fetch Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
