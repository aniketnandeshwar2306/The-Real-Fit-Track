// ============================================
//  MEAL ROUTES — routes/meals.js
// ============================================
//
//  These routes handle meal/nutrition logging:
//    POST /api/meals — Log a meal
//    GET  /api/meals — Get today's meals
//
//  LEARNING NOTE:
//  Notice how similar this is to workouts.js.
//  Backend APIs follow a pattern — once you learn one
//  route file, the rest are variations of the same thing!
// ============================================

const express = require('express')
const router = express.Router()
const DayData = require('../models/DayData')
const { protect } = require('../middleware/auth')
const { validateMeal } = require('../middleware/validate')
const { getTodayKey } = require('../utils/dateHelper')
const asyncHandler = require('../utils/asyncHandler')

// -----------------------------------------------
//  POST /api/meals
//  Log a meal with calories
// -----------------------------------------------
//
//  REQUEST BODY:
//  {
//    "name": "Chicken Biryani",
//    "calories": 650
//  }
//
router.post('/', protect, validateMeal, asyncHandler(async (req, res) => {
  // req.body has been validated and sanitized by validateMeal
  const { name, calories } = req.body

  // Create a timestamp for when the meal was logged
  const time = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  // Use $push to add the meal and $inc to increase total calories
  //
  // WHAT IS $inc?
  // $inc increments a field by the given value.
  // It's atomic — even if two requests come at the same time,
  // the count will be correct (unlike doing read + add + write).
  //
  const today = await DayData.findOneAndUpdate(
    { user: req.user._id, date: getTodayKey() },
    {
      $push: { meals: { name, calories, time } },
      $inc: { caloriesConsumed: calories },
      $setOnInsert: {
        waterMl: 0,
        workouts: [],
        workoutsCompleted: 0,
        sports: [],
        activities: [],
      },
    },
    { new: true, upsert: true }
  )

  res.status(201).json({
    success: true,
    message: `${name} logged (${calories} cal)`,
    meals: today.meals,
    caloriesConsumed: today.caloriesConsumed,
    deleteChancesUsed: today.deleteChancesUsed || 0,
  })
}))

// -----------------------------------------------
//  GET /api/meals
//  Get today's meals and calorie total
// -----------------------------------------------
router.get('/', protect, asyncHandler(async (req, res) => {
  const today = await DayData.findOne({
    user: req.user._id,
    date: getTodayKey(),
  })

  res.json({
    success: true,
    date: getTodayKey(),
    meals: today ? today.meals : [],
    caloriesConsumed: today ? today.caloriesConsumed : 0,
    deleteChancesUsed: today ? today.deleteChancesUsed : 0,
  })
}))

// -----------------------------------------------
//  DELETE /api/meals/:index
//  Remove a meal from today's list
// -----------------------------------------------
router.delete('/:index', protect, asyncHandler(async (req, res) => {
  const index = parseInt(req.params.index)
  // We need to fetch the document first to calculate properly and check limit
  const today = await DayData.findOne({
    user: req.user._id,
    date: getTodayKey(),
  })

  if (!today || index < 0 || index >= today.meals.length) {
    return res.status(400).json({ success: false, message: 'Invalid meal index' })
  }

  if (today.deleteChancesUsed >= 5) {
    return res.status(403).json({ success: false, message: 'You have exhausted your chances to delete logged items today (limit 5).' })
  }

  const removed = today.meals[index]

  today.meals.splice(index, 1)
  today.caloriesConsumed = Math.max(0, today.caloriesConsumed - removed.calories)
  today.deleteChancesUsed = (today.deleteChancesUsed || 0) + 1
  await today.save()

  res.json({
    success: true,
    message: `${removed.name} removed from meals`,
    meals: today.meals,
    caloriesConsumed: today.caloriesConsumed,
    deleteChancesUsed: today.deleteChancesUsed,
  })
}))

module.exports = router
