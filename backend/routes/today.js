// ============================================
//  TODAY ROUTE — routes/today.js
// ============================================

const express = require('express')
const router = express.Router()
const DayData = require('../models/DayData')
const WorkoutSchedule = require('../models/WorkoutSchedule')
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

  const deleteChancesUsed = today ? (today.deleteChancesUsed || 0) : 0

  if (!today) {
    // New day setup — let's check for an active workout schedule (Smart Auto Load)
    let autoLoadedWorkouts = []
    try {
      const schedule = await WorkoutSchedule.findOne({
        userId: req.user._id,
        isActive: true,
      })

      if (schedule) {
        let activeExercises = null

        if (schedule.cycleType === 'weekly') {
          const todayDate = new Date()
          const dayOfWeek = todayDate.getDay() // 0 = Sunday
          const scheduleDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1

          const dayData = schedule.weekDays.find(d => d.dayOfWeek === scheduleDayOfWeek)
          if (dayData && !dayData.isRestDay && dayData.exercises) {
            activeExercises = dayData.exercises
          }
        } else if (schedule.cycleType === 'rolling') {
          const cycleDay = schedule.currentRollingDay || 0
          const dayData = schedule.rollingDays.find(d => d.dayIndex === cycleDay)
          if (dayData && !dayData.isRestDay && dayData.exercises) {
            activeExercises = dayData.exercises
          }
        }

        if (activeExercises && activeExercises.length > 0) {
          autoLoadedWorkouts = activeExercises.map(ex => ({
            name: ex.name,
            sets: ex.sets || '',
            weight: ex.weight ? `${ex.weight}` : 'bodyweight',
            calories: ex.calories || 0,
            done: false
          }))
        }
      }
    } catch (err) {
      console.error('Error auto-loading embedded routine:', err)
    }

    return res.json({
      success: true,
      date: getTodayKey(),
      caloriesConsumed: 0,
      meals: [],
      waterMl: 0,
      workouts: autoLoadedWorkouts,
      workoutsCompleted: 0,
      sports: [],
      activities: [],
      deleteChancesUsed: 0
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
    deleteChancesUsed: deleteChancesUsed,
  })
}))

module.exports = router
