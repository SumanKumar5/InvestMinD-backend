const fetchPrice = require('../utils/fetchPrice');

exports.getPrice = async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const price = await fetchPrice(symbol);

    res.json({
      symbol: symbol.toUpperCase(),
      price: Number(price)  // Ensures type safety
    });
  } catch (error) {
    console.error('❌ Error fetching price:', error.message);
    res.status(500).json({ message: 'Failed to fetch price' });
  }
};
