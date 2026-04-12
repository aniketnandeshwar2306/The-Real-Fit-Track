// ============================================
//  ERROR HANDLING MIDDLEWARE — middleware/errorHandler.js
// ============================================
//
//  This middleware catches ALL errors (both caught and uncaught)
//  and sends a consistent error response.
//
//  EXPRESS ERROR FLOW:
//    1. Route handler throws error
//    2. asyncHandler catches it and calls next(error)
//    3. This middleware catches it
//    4. Formats and sends response
//
//  IMPORTANT: This must be registered LAST in server.js
//  Express recognizes error handlers by their 4 parameters: (err, req, res, next)

const AppError = require('../utils/AppError')

function errorHandler(err, req, res, next) {
  // Default error values
  let error = { ...err }
  error.message = err.message

  // Mongoose validation error (e.g., Email invalid)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    error = new AppError(messages.join(', '), 400, 'VALIDATION_ERROR')
  }

  // Mongoose duplicate key error (e.g., Email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0]
    error = new AppError(
      `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      400,
      'DUPLICATE_ERROR'
    )
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401, 'INVALID_TOKEN')
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401, 'TOKEN_EXPIRED')
  }

  // Cast error (e.g., Invalid MongoDB ObjectId)
  if (err.name === 'CastError') {
    error = new AppError(`Invalid ${err.path}`, 400, 'INVALID_ID')
  }

  // Set response status and format
  const statusCode = error.statusCode || 500
  const response = {
    success: false,
    statusCode,
    message: error.message || 'Internal server error',
    ...(error.errorCode && { errorCode: error.errorCode }),
    // Include stack trace only in development
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  }

  res.status(statusCode).json(response)
}

module.exports = errorHandler
