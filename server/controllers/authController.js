const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/generateTokens");
const { sendWelcomeEmail } = require("../services/emailService");

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/api/auth",
};

// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "An account with this email already exists" });
  }

  const user = await User.create({ name, email, password });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshTokens = [refreshToken];
  await user.save();

  sendWelcomeEmail(user.email, user.name); // fire-and-forget, non-blocking

  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(201).json({ user: user.toSafeObject(), accessToken });
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password +refreshTokens");
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-5); // keep last 5 sessions
  await user.save();

  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(200).json({ user: user.toSafeObject(), accessToken });
});

// @route POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (error) {
    return res.status(401).json({ message: "Refresh token expired or invalid" });
  }

  const user = await User.findById(decoded.id).select("+refreshTokens");
  if (!user || !user.refreshTokens.includes(token)) {
    return res.status(401).json({ message: "Refresh token not recognized" });
  }

  // Rotate refresh token
  const newRefreshToken = generateRefreshToken(user._id);
  user.refreshTokens = user.refreshTokens.filter((t) => t !== token).concat(newRefreshToken);
  await user.save();

  const newAccessToken = generateAccessToken(user._id);

  res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(200).json({ accessToken: newAccessToken });
});

// @route POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await User.findById(decoded.id).select("+refreshTokens");
      if (user) {
        user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
        await user.save();
      }
    } catch (error) {
      // token already invalid - nothing to clean up server-side
    }
  }

  res.clearCookie("refreshToken", { path: "/api/auth" });
  res.status(200).json({ message: "Logged out successfully" });
});

// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user.toSafeObject() });
});

// @route PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatarUrl } = req.body;

  if (name) req.user.name = name;
  if (avatarUrl) req.user.avatarUrl = avatarUrl;

  await req.user.save();
  res.status(200).json({ user: req.user.toSafeObject() });
});

module.exports = { register, login, refresh, logout, getMe, updateProfile };
