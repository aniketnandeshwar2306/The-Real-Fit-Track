// ============================================
//  AUTH MIDDLEWARE — middleware/auth.js
// ============================================
//
//  WHAT IS MIDDLEWARE?
//  Middleware is a function that runs BETWEEN the request
//  arriving at the server and the route handler processing it.
//
//  Think of it like a security guard at a building entrance:
//    Request → [Middleware: Check ID] → Route Handler
//
//  If the guard approves, you enter. If not, you're stopped.
//
//  WHAT IS JWT (JSON Web Token)?
//  JWT is a way to prove "I am logged in" without sending
//  username/password with every request.
//
//  How it works:
//    1. User logs in → Server creates a JWT token
//    2. User stores the token (in localStorage, cookie, etc.)
//    3. For every request, user sends: Authorization: Bearer <token>
//    4. Server verifies the token → allows or denies access
//
//  A JWT contains:
//    - Header (algorithm used)
//    - Payload (user data, like userId)
//    - Signature (proves it wasn't tampered with)
// ============================================

const jwt = require('jsonwebtoken')
const User = require('../models/User')
const AppError = require('../utils/AppError')

/**
 * protect — Middleware that checks if the user is authenticated.
 *
 * Usage in routes:
 *   router.get('/workouts', protect, getWorkouts)
 *   //                       ↑ runs BEFORE getWorkouts
 *
 * What it does:
 *   1. Reads the "Authorization" header from the request
 *   2. Extracts the JWT token (format: "Bearer eyJhbGci...")
 *   3. Verifies the token using our secret key
 *   4. Finds the user in the database
 *   5. Attaches user to req.user so route handlers can use it
 */
async function protect(req, res, next) {
  try {
    // Step 1: Get the Authorization header
    const authHeader = req.headers.authorization

    // Check if header exists AND starts with "Bearer"
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return next(
        new AppError(
          'Not authorized — no token provided. Send token in Authorization header as: Bearer <token>',
          401,
          'NO_TOKEN'
        )
      )
    }

    // Step 2: Extract the token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1]

    // Step 3: Verify the token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return next(new AppError('Token expired', 401, 'TOKEN_EXPIRED'))
      }
      return next(new AppError('Invalid token', 401, 'INVALID_TOKEN'))
    }

    // Step 4: Find the user in the database
    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      return next(new AppError('User not found', 401, 'USER_NOT_FOUND'))
    }

    // Step 5: Attach user to the request object
    req.user = user

    // Call next() to pass control to the next middleware/route handler
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * generateToken — Creates a JWT token for a user
 *
 * @param {string} userId — The MongoDB _id of the user
 * @returns {string} — The JWT token string
 *
 * jwt.sign() takes:
 *   1. Payload — data to encode (userId)
 *   2. Secret — our secret key (from .env)
 *   3. Options — expiresIn: when the token expires
 */
function generateToken(userId) {
  return jwt.sign(
    { userId },                    // Payload
    process.env.JWT_SECRET,        // Secret key
    { expiresIn: '30d' }          // Token expires in 30 days
  )
}

module.exports = { protect, generateToken }
