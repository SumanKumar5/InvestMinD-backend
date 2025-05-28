const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { exportHoldingsToExcel } = require('../controllers/exportController');

router.get('/portfolios/:id/export/excel', protect, exportHoldingsToExcel);

module.exports = router;
