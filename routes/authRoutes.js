const express = require('express');
const {
  signup,
  login,
  verifyEmail,
  resendOtp,
  requestPasswordReset,
  resetPassword
} = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const { googleLogin } = require("../controllers/authController");

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOtp);
router.post('/request-reset', requestPasswordReset); 
router.post('/reset-password', resetPassword);      
router.post('/google', googleLogin);

// Protected route example
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;
