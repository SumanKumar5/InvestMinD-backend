const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { getSmartAssetInsight } = require('../controllers/aiController');

router.get('/ai/insight/:portfolioId/:symbol', protect, getSmartAssetInsight);

module.exports = router;
