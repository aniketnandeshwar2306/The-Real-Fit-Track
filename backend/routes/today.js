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
const WorkoutSchedule = require('../models/WorkoutSchedule')
const WorkoutRoutine = require('../models/WorkoutRoutine')
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
    // New day setup — let's check for an active workout schedule (Smart Auto Load)
    let autoLoadedWorkouts = []
    try {
      const schedule = await WorkoutSchedule.findOne({
        userId: req.user._id,
        isActive: true,
      }).populate('weekDays.routineId')

      if (schedule) {
        const todayDate = new Date()
        const dayOfWeek = todayDate.getDay()
        const scheduleDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        let targetRoutineId = null

        if (schedule.cycleType === 'weekly') {
          const dayData = schedule.weekDays.find(d => d.dayOfWeek === scheduleDayOfWeek)
          if (dayData && !dayData.isRestDay && dayData.routineId) {
            targetRoutineId = dayData.routineId._id || dayData.routineId
          }
        } else if (schedule.cycleType === 'custom') {
          const daysSinceStart = Math.floor((todayDate - schedule.currentCycleStartDate) / (1000 * 60 * 60 * 24))
          const dayOfCycle = Math.max(0, daysSinceStart) % (schedule.cycleLengthWeeks * 7)
          const weekOfCycle = Math.floor(dayOfCycle / 7)
          
          if (schedule.weeks && schedule.weeks[weekOfCycle]) {
            const dayData = schedule.weeks[weekOfCycle].find(d => d.dayOfWeek === scheduleDayOfWeek)
            if (dayData && !dayData.isRestDay && dayData.routineId) {
              targetRoutineId = dayData.routineId
            }
          }
        }

        if (targetRoutineId) {
          const routine = await WorkoutRoutine.findById(targetRoutineId)
          if (routine && routine.exercises) {
            autoLoadedWorkouts = routine.exercises.map(ex => ({
              name: ex.name,
              sets: ex.sets || '',
              weight: ex.weight ? `${ex.weight}` : 'bodyweight',
              calories: ex.calories || 0,
              done: false
            }))
          }
        }
      }
    } catch (err) {
      console.error('Error auto-loading routine:', err)
    }

    // No data for today yet — return defaults (with natively auto-loaded workouts if any)
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
