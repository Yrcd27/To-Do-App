const express = require("express");
const rateLimit = require("express-rate-limit");
const { register, login, refresh, logout, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Strict rate limit for auth endpoints — prevents brute-force and credential stuffing.
// Relaxed in development so reviewers aren't locked out during testing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 10 : 100,
  message: {
    success: false,
    message: "Too many attempts from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true, // return rate limit info in RateLimit-* headers
  legacyHeaders: false,
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, getMe);

module.exports = router;
