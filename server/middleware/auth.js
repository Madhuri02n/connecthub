const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Protects routes: requires a valid JWT (from Authorization header or cookie)
 * and attaches the authenticated user to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new ApiError('Not authorized, no token provided', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError('Not authorized, token failed or expired', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError('The user belonging to this token no longer exists', 401);
  }
  if (!user.isActive) {
    throw new ApiError('This account has been deactivated', 403);
  }

  // Invalidate tokens issued before a password change
  if (user.passwordChangedAt) {
    const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
    if (decoded.iat < changedTimestamp) {
      throw new ApiError('Password was recently changed. Please log in again', 401);
    }
  }

  req.user = user;
  next();
});

/**
 * Restricts a route to admin users only. Must be used after `protect`.
 */
const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) {
    throw new ApiError('Admin access required', 403);
  }
  next();
};

/**
 * Optional auth: attaches req.user if a valid token is present, but does not
 * block the request if it's missing/invalid. Useful for public endpoints that
 * personalize output (e.g. "has current user liked this post").
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user && user.isActive) req.user = user;
  } catch (error) {
    // silently ignore - request proceeds unauthenticated
  }
  next();
});

module.exports = { protect, adminOnly, optionalAuth };
