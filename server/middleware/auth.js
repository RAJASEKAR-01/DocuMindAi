const asyncHandler = require("../utils/asyncHandler");
const { verifyAccessToken } = require("../utils/generateTokens");
const User = require("../models/User");

// Protects routes using the short-lived access token (Authorization: Bearer <token>)
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no access token provided" });
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Access token expired or invalid", code: "TOKEN_EXPIRED" });
  }
});

module.exports = { protect };
