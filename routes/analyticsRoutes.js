const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { getAnalytics } = require('../controllers/analyticsController');

router.get('/portfolios/:id/analytics', protect, getAnalytics);

module.exports = router;
