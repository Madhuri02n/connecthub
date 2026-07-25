const ApiError = require('../utils/ApiError');

/**
 * Catches 404s for unmatched routes and forwards to the error handler.
 */
const notFound = (req, res, next) => {
  const error = new ApiError(`Route not found - ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Centralized error handler. Normalizes Mongoose/JWT/Multer errors into a
 * consistent { success: false, message } shape, and only exposes stack
 * traces outside production.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };
  error.statusCode = err.statusCode || 500;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new ApiError(`Resource not found with id: ${err.value}`, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = new ApiError(`Duplicate value for ${field}. Please use another value`, 409);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new ApiError(messages.join(', '), 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError('Invalid token. Please log in again', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new ApiError('Session expired. Please log in again', 401);
  }

  // Multer errors
  if (err.name === 'MulterError') {
    error = new ApiError(`Upload error: ${err.message}`, 400);
  }

  const statusCode = error.statusCode || 500;

  console.error(`[${new Date().toISOString()}] ${statusCode} - ${error.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
