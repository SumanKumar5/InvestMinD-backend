const express = require('express');
const router = express.Router();
const {
  addTransaction,
  getTransactions
} = require('../controllers/transactionController');
const protect = require('../middleware/authMiddleware');

router
  .route('/holdings/:id/transactions')
  .post(protect, addTransaction)
  .get(protect, getTransactions);

module.exports = router;
