const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { getAssetInsight } = require('../controllers/aiController');

router.post('/ai/asset-summary', protect, getAssetInsight);

module.exports = router;
