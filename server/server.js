require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const chatRoutes = require("./routes/chatRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

// --- Core middleware ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // required so the refresh-token httpOnly cookie is sent/received
  })
);
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DocuMind AI Backend is Running 🚀",
  });
});
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Rate limiting ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Too many auth requests, please try again later" },
});
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: "Too many requests, please slow down" },
});

app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "DocuMind AI API", time: new Date().toISOString() });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/analytics", analyticsRoutes);

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (process.env.MONGO_URI) {
    await connectDB();
  } else {
    console.warn("MONGO_URI not set - skipping DB connection (set it in .env to run for real)");
  }

  app.listen(PORT, () => {
    console.log(`DocuMind AI server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  });
};

startServer();

module.exports = app;
