const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const auth = require("../middleware/auth");
const User = require("../models/User");
const { sendOTPEmail } = require("../utils/email");
const router = express.Router();

const otpStore = new Map();

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// @route   POST /api/auth/send-otp
// @desc    Send OTP to user's email
router.post("/send-otp", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        error: "Name, email and phone are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP for 5 minutes
    otpStore.set(normalizedEmail, {
      otp,
      name: name.trim(),
      phone: phone.trim(),
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    await sendOTPEmail(normalizedEmail, otp);

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("❌ Send OTP error:", error);

    res.status(500).json({
      error: "Failed to send OTP",
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and login user
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        error: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const storedOTP = otpStore.get(normalizedEmail);

    if (!storedOTP) {
      return res.status(400).json({
        error: "OTP not found or expired. Please request a new OTP.",
      });
    }

    if (Date.now() > storedOTP.expiresAt) {
      otpStore.delete(normalizedEmail);

      return res.status(400).json({
        error: "OTP has expired. Please request a new OTP.",
      });
    }

    if (storedOTP.otp !== otp.toString().trim()) {
      return res.status(400).json({
        error: "Invalid OTP",
      });
    }

    // OTP is valid — remove it so it cannot be reused
    otpStore.delete(normalizedEmail);

    // Find existing user
    let user = await User.findOne({
      email: normalizedEmail,
    });

    // Create new user if not found
    if (!user) {
      user = await User.create({
        email: normalizedEmail,
        name: storedOTP.name,
        phone: storedOTP.phone,
        lastLogin: new Date(),
      });
    } else {
      // Update existing user's information
      user.name = storedOTP.name;
      user.phone = storedOTP.phone;
      user.lastLogin = new Date();

      await user.save();
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Verify OTP error:", error);

    res.status(500).json({
      error: "Failed to verify OTP",
    });
  }
});


// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/signin?error=auth_failed`,
  }),
  (req, res) => {
    const token = generateToken(req.user);
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
router.get("/me", auth, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      avatar: req.user.avatar,
      phone: req.user.phone,
      role: req.user.role,
      createdAt: req.user.createdAt,
    },
  });
});

// @route   POST /api/auth/logout
// @desc    Logout (client-side token removal)
router.post("/logout", auth, (req, res) => {
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
