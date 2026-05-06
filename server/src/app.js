const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const todoRoutes = require("./routes/todoRoutes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// --- Security headers (Helmet sets ~15 HTTP headers in one call) ---
app.use(helmet());

// --- CORS — allow only the configured frontend origin ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true, // required so the browser sends the refresh token cookie
  })
);

// --- Body parsers ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Cookie parser (needed to read the httpOnly refresh token cookie) ---
app.use(cookieParser());

// --- NoSQL injection prevention ---
// Strips '$' and '.' from request body, params, and query strings
app.use(mongoSanitize());

// --- General rate limit — applied to all routes ---
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

// --- Health check ---
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TODO API is running",
  });
});

// --- API routes ---
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
