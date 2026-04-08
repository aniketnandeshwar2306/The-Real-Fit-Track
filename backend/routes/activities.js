// ============================================
//  ACTIVITIES ROUTES — routes/activities.js
// ============================================
//
//  Log daily activities (sleeping, walking, cooking, etc.)
//  Users set how many hours they spent on each activity.
//
//  ROUTE:
//    PUT /api/activities — Set daily activities (replaces all)
// ============================================

const express = require('express')
const router = express.Router()
const DayData = require('../models/DayData')
const { protect } = require('../middleware/auth')
const { validateActivities } = require('../middleware/validate')
const { getTodayKey } = require('../utils/dateHelper')
const asyncHandler = require('../utils/asyncHandler')

function calcMETCalories(met, weightKg, durationMinutes) {
  return Math.round(met * weightKg * (durationMinutes / 60))
}

// -----------------------------------------------
//  PUT /api/activities
//  Set daily activities for today
// -----------------------------------------------
//
//  WHY PUT instead of POST?
//  - POST = "create a new resource" (adding one item)
//  - PUT = "replace/update an existing resource"
//  Here, we're replacing the ENTIRE activities list,
//  not adding one activity. That's why we use PUT.
//
//  REQUEST BODY:
//  {
//    "activities": [
//      { "name": "Sleeping", "icon": "😴", "met": 0.95, "hours": 7, "color": "#6366f1" },
//      { "name": "Sitting", "icon": "💺", "met": 1.3, "hours": 8, "color": "#f59e0b" },
//      { "name": "Brisk Walking", "icon": "🚶‍♂️", "met": 3.8, "hours": 1, "color": "#10b981" }
//    ]
//  }
//
router.put('/', protect, validateActivities, asyncHandler(async (req, res) => {
  // req.body has been validated and sanitized by validateActivities
  const { activities } = req.body

  // Calculate calories for each activity on the server
  const weight = req.user.profile?.weight || 70
  const withCalories = activities.map(a => ({
    name: a.name,
    icon: a.icon || '',
    met: a.met,
    hours: a.hours,
    calories: calcMETCalories(a.met, weight, a.hours * 60),
    color: a.color || '#888',
  }))

  // $set replaces the entire 'activities' field
  const today = await DayData.findOneAndUpdate(
    { user: req.user._id, date: getTodayKey() },
    {
      $set: { activities: withCalories },
      $setOnInsert: {
        caloriesConsumed: 0,
        meals: [],
        waterMl: 0,
        workouts: [],
        workoutsCompleted: 0,
        sports: [],
      },
    },
    { new: true, upsert: true }
  )

  const totalActivityCalories = withCalories.reduce((sum, a) => sum + a.calories, 0)

  res.json({
    success: true,
    message: `Daily activities updated — ${totalActivityCalories} cal burned from activities`,
    activities: today.activities,
  })
}))

module.exports = router
