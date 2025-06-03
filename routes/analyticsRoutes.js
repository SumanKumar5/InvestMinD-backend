const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getAnalytics,
  getStockDistribution,
  getBestWorstPerformers
} = require('../controllers/analyticsController');

router.get('/:id/analytics', protect, getAnalytics);
router.get('/:id/stocks', protect, getStockDistribution); 
router.get('/:id/best-worst', protect, getBestWorstPerformers);

module.exports = router;
