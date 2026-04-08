// ============================================
//  PROFILE ROUTES — routes/profile.js
// ============================================
//
//  These routes handle updating the user's fitness profile
//  (weight, height, age, gender, activity level, goal).
//
//  All routes here are PROTECTED — user must be logged in.
//
//  ROUTE:
//    PUT /api/profile — Update fitness profile
// ============================================

const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { protect } = require('../middleware/auth')
const { validateProfile } = require('../middleware/validate')

// -----------------------------------------------
//  PUT /api/profile
//  Update the user's fitness profile
// -----------------------------------------------
//
//  REQUEST BODY (JSON):
//  {
//    "weight": 70,
//    "height": 175,
//    "age": 22,
//    "gender": "male",
//    "activityLevel": "moderate",
//    "goal": "gain muscle"
//  }
//
router.put('/', protect, validateProfile, async (req, res) => {
  try {
    const { weight, height, age, gender, activityLevel, goal } = req.body

    // findByIdAndUpdate() finds a document by its _id and updates it.
    //
    // Arguments:
    //   1. The document's _id (from req.user, set by auth middleware)
    //   2. The update object — $set replaces specific fields
    //   3. Options:
    //      - new: true → return the UPDATED document (not the old one)
    //      - runValidators: true → check schema rules on the update
    //
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'profile.weight': weight,
          'profile.height': height,
          'profile.age': age,
          'profile.gender': gender,
          'profile.activityLevel': activityLevel,
          'profile.goal': goal,
        },
      },
      { new: true, runValidators: true }
    ).select('-password')   // Don't return the password hash

    res.json({
      success: true,
      message: 'Profile updated!',
      profile: user.profile,
    })

  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    })
  }
})

module.exports = router
