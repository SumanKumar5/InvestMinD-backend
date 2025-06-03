const express = require('express');
const router = express.Router();
const { getPerformance } = require('../controllers/performanceController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:id/performance', authMiddleware, getPerformance);

module.exports = router;
