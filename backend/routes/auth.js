// ============================================
//  AUTH ROUTES — routes/auth.js
// ============================================
//
//  WHAT IS A ROUTE?
//  A route maps a URL + HTTP method to a function.
//  Example: POST /api/auth/signup → runs the signup function
//
//  WHAT IS A ROUTER?
//  Express Router groups related routes together.
//  All routes in this file start with /api/auth
//
//  ROUTES IN THIS FILE:
//    POST /api/auth/signup  — Create a new account
//    POST /api/auth/login   — Login and get a token
//    GET  /api/auth/me      — Get current user (protected)
// ============================================

const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { protect, generateToken } = require('../middleware/auth')
const asyncHandler = require('../utils/asyncHandler')
const AppError = require('../utils/AppError')
const { validateRequest } = require('../middleware/validators')
const { signupSchema, loginSchema } = require('../middleware/schemas')

// -----------------------------------------------
//  POST /api/auth/signup
//  Create a new user account
// -----------------------------------------------
//
//  REQUEST BODY (JSON):
//  {
//    "username": "aniket",
//    "email": "aniket@example.com",
//    "password": "mypassword123"
//  }
//
//  RESPONSE:
//  {
//    "success": true,
//    "token": "eyJhbGci...",
//    "user": { "_id": "...", "username": "aniket", "email": "..." }
//  }
//
router.post(
  '/signup',
  validateRequest(signupSchema),
  asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      throw new AppError(
        existingUser.email === email
          ? 'Email already registered'
          : 'Username already taken',
        400,
        'DUPLICATE_USER'
      )
    }

    // Create the new user
    const user = await User.create({ username, email, password })

    // Generate a JWT token for the new user
    const token = generateToken(user._id)

    // Send the response
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
      },
    })
  })
)

// -----------------------------------------------
//  POST /api/auth/login
//  Login with username/email and password
// -----------------------------------------------
//
//  REQUEST BODY (JSON):
//  {
//    "email": "aniket@example.com",
//    "password": "mypassword123"
//  }
//
router.post(
  '/login',
  validateRequest(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })

    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDS')
    }

    // Compare the provided password with the stored hash
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDS')
    }

    // Generate token and send response
    const token = generateToken(user._id)

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
      },
    })
  })
)

// -----------------------------------------------
//  GET /api/auth/me
//  Get the currently logged-in user's info
//  (Protected — requires valid JWT token)
// -----------------------------------------------
//
//  HEADERS:
//    Authorization: Bearer <token>
//
//  The 'protect' middleware runs first.
//  If the token is valid, req.user is set automatically.
//
router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    // req.user was set by the protect middleware
    res.json({
      success: true,
      user: req.user,
    })
  })
)

module.exports = router
