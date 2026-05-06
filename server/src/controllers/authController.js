const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Refresh token cookie options
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true, // not accessible via document.cookie — prevents XSS token theft
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "strict", // blocks CSRF requests from other origins
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

// Helper to set the refresh token in an HTTP-only cookie
const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, REFRESH_COOKIE_OPTIONS);
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Basic presence check before hitting the DB
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are all required.",
      });
    }

    // Check for duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const user = await User.create({ name, email, password });

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Persist the refresh token so we can invalidate it on logout
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      accessToken,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login an existing user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Explicitly select password (select: false by default) and refreshToken
    const user = await User.findOne({ email }).select("+password +refreshToken");

    // Use a single generic message to prevent user enumeration attacks
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      accessToken,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Issue a new access token using the refresh token cookie
// @route   POST /api/auth/refresh
const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No refresh token found. Please log in.",
      });
    }

    // Verify the refresh token's signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is invalid or has expired. Please log in again.",
      });
    }

    // Confirm the token in the cookie matches the one stored in the DB.
    // If they differ, the token was already rotated (possible token reuse attack).
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is no longer valid. Please log in again.",
      });
    }

    // Rotate: issue a brand-new pair and invalidate the old refresh token
    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, newRefreshToken);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout — clear refresh token cookie and invalidate in DB
// @route   POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      // Remove the refresh token from DB so it can't be reused
      await User.findOneAndUpdate(
        { refreshToken: token },
        { refreshToken: null }
      );
    }

    // Clear the cookie on the client
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get the currently authenticated user's profile
// @route   GET /api/auth/me
const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    },
  });
};

module.exports = { register, login, refresh, logout, getMe };
