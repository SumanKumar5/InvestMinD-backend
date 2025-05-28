const axios = require('axios');

const fetchPrice = async (symbol) => {
  const url = `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${process.env.TWELVE_API_KEY}`;
  const response = await axios.get(url);

  if (response.data.status === 'error') {
    throw new Error(response.data.message || 'API error');
  }

  return parseFloat(response.data.price);
};

module.exports = fetchPrice;
