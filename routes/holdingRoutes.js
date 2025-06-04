const express = require('express');
const {
  addHolding,
  getHoldings,
  deleteHolding,
  getHoldingsSummary,
  getHoldingDetails 
} = require('../controllers/holdingController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/portfolios/:id/holdings')
  .get(protect, getHoldings)
  .post(protect, addHolding);

router.route('/portfolios/:id/summary')
  .get(protect, getHoldingsSummary); 

router.route('/holdings/:id')
  .get(protect, getHoldingDetails)
  .delete(protect, deleteHolding);

module.exports = router;
