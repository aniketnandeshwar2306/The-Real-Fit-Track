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
const { validateSignup, validateLogin } = require('../middleware/validate')

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
router.post('/signup', validateSignup, async (req, res) => {
  try {
    // req.body has already been validated and sanitized by validateSignup
    const { username, email, password } = req.body

    // 3. Check if user already exists
    // findOne() returns the first document that matches, or null
    const existingUser = await User.findOne({
      // $or means "match ANY of these conditions"
      // This checks if either the email OR username is already taken
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email
          ? 'Email already registered'
          : 'Username already taken',
      })
    }

    // 4. Create the new user
    // User.create() does two things:
    //   a) Creates a new document with the given data
    //   b) Saves it to the database
    // The pre('save') middleware in User.js will hash the password automatically!
    const user = await User.create({ username, email, password })

    // 5. Generate a JWT token for the new user
    const token = generateToken(user._id)

    // 6. Send the response
    // Status 201 = "Created" (something new was created successfully)
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

  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during signup',
      error: error.message,
    })
  }
})

// -----------------------------------------------
//  POST /api/auth/login
//  Login with username/email and password
// -----------------------------------------------
//
//  REQUEST BODY (JSON):
//  {
//    "login": "aniket",         ← can be username OR email
//    "password": "mypassword123"
//  }
//
router.post('/login', validateLogin, async (req, res) => {
  try {
    // req.body has already been validated and sanitized by validateLogin
    const { login, password } = req.body

    // Find user by username OR email
    const user = await User.findOne({
      $or: [{ username: login }, { email: login }],
    })

    // SECURITY: Use a GENERIC error message for both cases.
    //
    // WHY?
    // If we say "user not found" vs "wrong password", an attacker
    // can figure out which usernames/emails exist in our database.
    // This is called "user enumeration" and it's a security risk.
    // By using the same message for both, the attacker learns nothing.
    //
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // Compare the provided password with the stored hash
    // user.comparePassword() is the instance method we defined in User.js
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
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

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    })
  }
})

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
router.get('/me', protect, async (req, res) => {
  // req.user was set by the protect middleware
  res.json({
    success: true,
    user: req.user,
  })
})

module.exports = router
