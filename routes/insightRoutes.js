const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { getInsight } = require('../controllers/insightController');

router.get('/insight', protect, getInsight);

module.exports = router;
