const express = require('express');
const router = express.Router();
const { getTransactions } = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/transactions/holdings/:id
router.get('/holdings/:id', authMiddleware, getTransactions);

module.exports = router;
