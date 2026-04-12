// ============================================
//  CUSTOM ERROR CLASS — utils/AppError.js
// ============================================
//
//  This helps us throw consistent, structured errors
//  throughout the application.
//
//  INSTEAD OF random error responses:
//    res.status(400).json({ message: 'Bad request' })
//    res.status(500).json({ error: 'Something went wrong' })
//    res.status(401).json({ success: false, msg: 'Unauthorized' })
//
//  WE USE consistent AppError:
//    throw new AppError('User not found', 404)
//    throw new AppError('Invalid email format', 400)
//    throw new AppError('Unauthorized access', 401)
//
//  This is passed to the error handler middleware which formats
//  all errors consistently.

class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message)
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.isOperational = true // Distinguishes from programming errors

    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = AppError
