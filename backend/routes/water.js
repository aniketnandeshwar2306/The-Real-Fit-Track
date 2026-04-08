// ============================================
//  WATER ROUTES — routes/water.js
// ============================================
//
//  Simple route to log water intake for the day.
//
//  ROUTE:
//    POST /api/water — Add water (in ml)
// ============================================

const express = require('express')
const router = express.Router()
const DayData = require('../models/DayData')
const { protect } = require('../middleware/auth')
const { validateWater } = require('../middleware/validate')
const { getTodayKey } = require('../utils/dateHelper')
const asyncHandler = require('../utils/asyncHandler')

// -----------------------------------------------
//  POST /api/water
//  Add water intake
// -----------------------------------------------
//
//  REQUEST BODY:
//  { "ml": 250 }
//
//  LEARNING NOTE:
//  We use $inc to add to the existing waterMl value.
//  $min ensures we don't exceed 5000ml (5 liters).
//  But since $inc and $min can't be used on the same
//  field simultaneously, we do it in two steps:
//    1. $inc to add the water
//    2. Then cap it at 5000 with a check
//
router.post('/', protect, validateWater, asyncHandler(async (req, res) => {
  // req.body has been validated and sanitized by validateWater
  const { ml } = req.body

  // First, increment the water
  let today = await DayData.findOneAndUpdate(
    { user: req.user._id, date: getTodayKey() },
    {
      $inc: { waterMl: ml },
      $setOnInsert: {
        caloriesConsumed: 0,
        meals: [],
        workouts: [],
        workoutsCompleted: 0,
        sports: [],
        activities: [],
      },
    },
    { new: true, upsert: true }
  )

  // Cap at 5000ml
  if (today.waterMl > 5000) {
    today.waterMl = 5000
    await today.save()
  }

  res.json({
    success: true,
    message: `+${ml}ml water logged 💧`,
    waterMl: today.waterMl,
  })
}))

module.exports = router
