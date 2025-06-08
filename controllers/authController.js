const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @desc   Register new user with email OTP
// @route  POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    const user = await User.create({
      name,
      email,
      password,
      emailVerificationCode: otp,
      emailVerificationExpires: otpExpires,
      lastOtpSentAt: new Date(),
    });

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"InvestMinD" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email - InvestMinD",
      text: `Your OTP to verify your email is: ${otp}`,
    });

    return res.status(201).json({
      message: "OTP sent to your email. Please verify to complete registration.",
    });
  } catch (err) {
    console.error("❌ Signup Error:", err);
    res.status(500).json({ message: "Server error during signup" });
  }
};

// @desc   Resend OTP to user's email
// @route  POST /api/auth/resend-otp
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const now = Date.now();
    const cooldown = 60 * 1000;

    if (user.lastOtpSentAt && now - user.lastOtpSentAt.getTime() < cooldown) {
      const secondsLeft = Math.ceil(
        (cooldown - (now - user.lastOtpSentAt.getTime())) / 1000
      );
      return res.status(429).json({
        message: `Please wait ${secondsLeft} seconds before requesting a new OTP`,
      });
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationCode = newOtp;
    user.emailVerificationExpires = now + 10 * 60 * 1000;
    user.lastOtpSentAt = new Date(now);
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"InvestMinD" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Resend OTP - InvestMinD",
      text: `Your new OTP is: ${newOtp}`,
    });

    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error("❌ Resend OTP Error:", err);
    return res.status(500).json({ message: "Server error while resending OTP" });
  }
};

// @desc   Verify email using OTP
// @route  POST /api/auth/verify-email
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (
      user.emailVerificationCode !== otp ||
      user.emailVerificationExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.emailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully!",
      token: generateToken(user._id),
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("❌ Email verification error:", err);
    res.status(500).json({ message: "Server error during verification" });
  }
};

// @desc   Login user
// @route  POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "This email is not registered. Please sign up." });
    }

    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Incorrect password. Please try again or reset your password." });
    }

    // Auto-resend OTP if email is not verified
    if (!user.emailVerified) {
      const now = Date.now();
      const cooldown = 60 * 1000;

      if (!user.lastOtpSentAt || now - user.lastOtpSentAt.getTime() >= cooldown) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.emailVerificationCode = otp;
        user.emailVerificationExpires = now + 10 * 60 * 1000;
        user.lastOtpSentAt = new Date(now);
        await user.save();

        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"InvestMinD" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "Verify your email - InvestMinD",
          text: `Your OTP to verify your email is: ${otp}`,
        });
      }

      return res.status(403).json({
        message: "Your email is not verified. A new OTP has been sent to your inbox.",
        needsVerification: true,
        email: user.email,
      });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};

// @desc   Request password reset OTP
// @route  POST /api/auth/request-reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "No account found with that email" });
    }

    // Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = otpExpires;
    await user.save();

    // Send OTP email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"InvestMinD" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset your password - InvestMinD",
      text: `Your password reset code is: ${otp}`,
    });

    return res.json({ message: "Password reset code sent to your email." });
  } catch (err) {
    console.error("❌ Request Password Reset Error:", err);
    return res.status(500).json({ message: "Server error while requesting password reset." });
  }
};

// @desc   Reset password using OTP
// @route  POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      user.resetPasswordOtp !== otp ||
      user.resetPasswordExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error("❌ Reset Password Error:", err);
    return res.status(500).json({ message: "Server error during password reset." });
  }
};
