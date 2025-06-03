const Portfolio = require('../models/Portfolio');
const Holding = require('../models/Holding');
const Snapshot = require('../models/Snapshot');
const fetchPrice = require('../utils/fetchPrice');

const takePortfolioSnapshots = async () => {
  console.log(`[Snapshot Job] Starting...`);

  try {
    const portfolios = await Portfolio.find();

    for (const portfolio of portfolios) {
      const holdings = await Holding.find({ portfolio: portfolio._id });

      let totalValue = 0;

      for (const holding of holdings) {
        const { symbol, quantity } = holding;

        try {
          const price = await fetchPrice(symbol); // cached fetch
          totalValue += price * quantity;
        } catch (err) {
          console.error(`[Snapshot Job] Failed to fetch price for ${symbol}:`, err.message);
        }
      }

      const snapshot = new Snapshot({
        portfolioId: portfolio._id,
        timestamp: new Date(),
        totalValue: Number(totalValue.toFixed(2)) // ✅ enforced numeric type with precision
      });

      await snapshot.save();
      console.log(`[Snapshot Job] Snapshot saved for portfolio ${portfolio._id} | Value: ${totalValue.toFixed(2)}`);
    }

    console.log(`[Snapshot Job] Completed.`);
  } catch (err) {
    console.error(`[Snapshot Job] Error:`, err);
  }
};

module.exports = takePortfolioSnapshots;
