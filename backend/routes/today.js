// ============================================
//  TODAY ROUTE — routes/today.js
// ============================================
//
//  Returns ALL of today's fitness data in one request.
//  This is used by the frontend on page load to restore
//  the full state (workouts, meals, water, sports, activities).
//
//  ROUTE:
//    GET /api/today — Get all data for today
// ============================================

const express = require('express')
const router = express.Router()
const DayData = require('../models/DayData')
const { protect } = require('../middleware/auth')
const { getTodayKey } = require('../utils/dateHelper')
const asyncHandler = require('../utils/asyncHandler')

// -----------------------------------------------
//  GET /api/today
//  Get ALL data for today in a single request
// -----------------------------------------------
router.get('/', protect, asyncHandler(async (req, res) => {
  const today = await DayData.findOne({
    user: req.user._id,
    date: getTodayKey(),
  })

  if (!today) {
    // No data for today yet — return defaults
    return res.json({
      success: true,
      date: getTodayKey(),
      caloriesConsumed: 0,
      meals: [],
      waterMl: 0,
      workouts: [],
      workoutsCompleted: 0,
      sports: [],
      activities: [],
    })
  }

  res.json({
    success: true,
    date: today.date,
    caloriesConsumed: today.caloriesConsumed,
    meals: today.meals,
    waterMl: today.waterMl,
    workouts: today.workouts,
    workoutsCompleted: today.workoutsCompleted,
    sports: today.sports,
    activities: today.activities,
  })
}))

module.exports = router
