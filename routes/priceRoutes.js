const express = require('express');
const { getPrice } = require('../controllers/priceController');

const router = express.Router();

router.get('/price/:symbol', getPrice);

module.exports = router;
