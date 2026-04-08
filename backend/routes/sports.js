// ============================================
//  SPORTS ROUTES — routes/sports.js
// ============================================
//
//  Log sports activities like Cricket, Football, etc.
//  with MET-based calorie calculation.
//
//  WHAT IS MET?
//  MET (Metabolic Equivalent of Task) measures the energy
//  cost of an activity. Sitting = 1 MET, Running = 8-10 MET.
//
//  Calories Formula:
//    calories = MET × weight(kg) × duration(hours)
//
//  ROUTE:
//    POST /api/sports — Log a sport activity
// ============================================

const express = require('express')
const router = express.Router()
const DayData = require('../models/DayData')
const { protect } = require('../middleware/auth')
const { validateSport } = require('../middleware/validate')
const { getTodayKey } = require('../utils/dateHelper')
const asyncHandler = require('../utils/asyncHandler')

// MET-based calorie calculation (same as frontend)
function calcMETCalories(met, weightKg, durationMinutes) {
  return Math.round(met * weightKg * (durationMinutes / 60))
}

// -----------------------------------------------
//  POST /api/sports
//  Log a sports activity
// -----------------------------------------------
//
//  REQUEST BODY:
//  {
//    "name": "Cricket",
//    "icon": "🏏",
//    "met": 5.0,
//    "duration": 60
//  }
//
//  The server calculates calories based on user's weight.
//
router.post('/', protect, validateSport, asyncHandler(async (req, res) => {
  // req.body has been validated and sanitized by validateSport
  const { name, icon, met, duration } = req.body

  // Get user's weight for calorie calculation
  // If no weight is set, default to 70kg
  const weight = req.user.profile?.weight || 70
  const calories = calcMETCalories(met, weight, duration)

  const time = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const today = await DayData.findOneAndUpdate(
    { user: req.user._id, date: getTodayKey() },
    {
      $push: {
        sports: { name, icon: icon || '🏅', met, duration, calories, time },
      },
      $setOnInsert: {
        caloriesConsumed: 0,
        meals: [],
        waterMl: 0,
        workouts: [],
        workoutsCompleted: 0,
        activities: [],
      },
    },
    { new: true, upsert: true }
  )

  res.status(201).json({
    success: true,
    message: `${name} logged — ${calories} calories burned! 🔥`,
    sport: today.sports[today.sports.length - 1],
    totalSports: today.sports,
  })
}))

module.exports = router
