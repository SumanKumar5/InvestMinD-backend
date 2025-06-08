const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Setup transporter once
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const user = await User.create({
      name,
      email,
      password,
      emailVerificationCode: otp,
      emailVerificationExpires: otpExpires,
      lastOtpSentAt: new Date(),
    });

    await transporter.sendMail({
      from: `"InvestMinD" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to InvestMinD – Verify Your Email",
      text: `Hi ${name},

Thank you for signing up with InvestMinD – your smart companion for tracking and optimizing your investments.

To complete your registration, please verify your email address using the OTP below:

🔐 OTP: ${otp}

This code is valid for 10 minutes. If you didn’t sign up, please ignore this email.

Happy Investing,
Team InvestMinD`,
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

    await transporter.sendMail({
      from: `"InvestMinD" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your New OTP for InvestMinD Email Verification",
      text: `Hi ${user.name},

As requested, here is your new OTP to verify your email address on InvestMinD:

🔐 OTP: ${newOtp}

This code is valid for 10 minutes. If you didn’t request this OTP, you can safely ignore this email.

Thanks for being part of the InvestMinD journey!
Team InvestMinD`,
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

    if (!user.emailVerified) {
      const now = Date.now();
      const cooldown = 60 * 1000;

      if (!user.lastOtpSentAt || now - user.lastOtpSentAt.getTime() >= cooldown) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.emailVerificationCode = otp;
        user.emailVerificationExpires = now + 10 * 60 * 1000;
        user.lastOtpSentAt = new Date(now);
        await user.save();

        await transporter.sendMail({
          from: `"InvestMinD" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "Complete Your Email Verification – InvestMinD",
          text: `Hi ${user.name},

We noticed you're trying to log in, but your email isn’t verified yet.

To access your account, please verify your email using the OTP below:

🔐 OTP: ${otp}

This code is valid for 10 minutes. Once verified, you'll be able to access all features of InvestMinD.

Need help? Just reply to this email.

Best regards,
Team InvestMinD`,
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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = otpExpires;
    await user.save();

    await transporter.sendMail({
      from: `"InvestMinD" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset Your InvestMinD Password Securely",
      text: `Hi ${user.name},

You’ve requested to reset your password for InvestMinD.

Use the OTP below to reset your password:

🔐 OTP: ${otp}

This code is valid for 10 minutes. If you didn’t request a password reset, please secure your account or contact us immediately.

Stay secure,
Team InvestMinD`,
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

    user.password = newPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Optional: Confirm email
    await transporter.sendMail({
      from: `"InvestMinD" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your InvestMinD Password Has Been Changed",
      text: `Hi ${user.name},

Your password has been successfully updated for your InvestMinD account.

If this was not you, please reset your password immediately or contact our support team to secure your account.

Thank you for staying secure with InvestMinD.

Warm regards,
Team InvestMinD`,
    });

    return res.json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error("❌ Reset Password Error:", err);
    return res.status(500).json({ message: "Server error during password reset." });
  }
};
