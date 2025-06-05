const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getInsight,
  getInsightForPortfolio,
} = require('../controllers/insightController');

router.get('/insight', protect, getInsight); // for all portfolios
router.get('/insight/:portfolioId', protect, getInsightForPortfolio); // for a specific portfolios

module.exports = router;
