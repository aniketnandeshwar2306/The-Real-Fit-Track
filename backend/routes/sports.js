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
    deleteChancesUsed: today.deleteChancesUsed || 0,
  })
}))

// -----------------------------------------------
//  DELETE /api/sports/:index
//  Remove a sport activity from today's list
// -----------------------------------------------
router.delete('/:index', protect, asyncHandler(async (req, res) => {
  const index = parseInt(req.params.index)
  // Fetch existing day data to perform limits logic
  const today = await DayData.findOne({
    user: req.user._id,
    date: getTodayKey()
  })

  if (!today || index < 0 || index >= today.sports.length) {
    return res.status(400).json({ success: false, message: 'Invalid sport index' })
  }

  if (today.deleteChancesUsed >= 5) {
    return res.status(403).json({ success: false, message: 'You have exhausted your chances to delete logged items today (limit 5).' })
  }

  const removed = today.sports[index]

  today.sports.splice(index, 1)
  today.deleteChancesUsed = (today.deleteChancesUsed || 0) + 1
  await today.save()

  res.json({
    success: true,
    message: `${removed.name} removed from sports`,
    totalSports: today.sports,
    deleteChancesUsed: today.deleteChancesUsed,
  })
}))

module.exports = router
