const express = require('express');
const router = express.Router();
const {
  getPortfolios,
  createPortfolio,
  deletePortfolio
} = require('../controllers/portfolioController');
const protect = require('../middleware/authMiddleware');
const { getPortfolioStats } = require('../controllers/portfolioController');

router.route('/')
  .get(protect, getPortfolios)
  .post(protect, createPortfolio);

router.route('/:id')
  .delete(protect, deletePortfolio);

router.get('/:id/stats', protect, getPortfolioStats);  

module.exports = router;
