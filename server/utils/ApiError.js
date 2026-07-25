/**
 * Standardized application error. Throw this from controllers/services so the
 * centralized errorHandler middleware can format a consistent JSON response.
 */
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguishes expected errors from bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
