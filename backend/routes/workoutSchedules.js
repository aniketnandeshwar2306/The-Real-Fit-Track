const express = require('express')
const router = express.Router()
const WorkoutSchedule = require('../models/WorkoutSchedule')
const { protect } = require('../middleware/auth')
const asyncHandler = require('../utils/asyncHandler')

/**
 * POST /api/workout-schedules
 * Create a new schedule (and deactivate previous)
 */
router.post('/', protect, asyncHandler(async (req, res) => {
  const { cycleType, weekDays, cycleLengthDays, rollingDays } = req.body

  if (!cycleType || !['weekly', 'rolling'].includes(cycleType)) {
    return res.status(400).json({ message: 'Valid cycleType is required (weekly or rolling)' })
  }

  // Deactivate previous active schedule
  await WorkoutSchedule.updateMany(
    { userId: req.user._id, isActive: true },
    { isActive: false }
  )

  const schedule = new WorkoutSchedule({
    userId: req.user._id,
    cycleType,
    isActive: true,
    weekDays: cycleType === 'weekly' ? weekDays : [],
    cycleLengthDays: cycleType === 'rolling' ? cycleLengthDays : 3,
    rollingDays: cycleType === 'rolling' ? rollingDays : [],
    currentRollingDay: 0,
  })

  await schedule.save()
  res.status(201).json(schedule)
}))

/**
 * GET /api/workout-schedules
 * Get the active schedule for the logged-in user
 */
router.get('/', protect, asyncHandler(async (req, res) => {
  const schedule = await WorkoutSchedule.findOne({
    userId: req.user._id,
    isActive: true,
  })
  res.json(schedule)
}))

/**
 * GET /api/workout-schedules/today-routine/get
 * Get the routine assigned to today
 */
router.get('/today-routine/get', protect, asyncHandler(async (req, res) => {
  const schedule = await WorkoutSchedule.findOne({
    userId: req.user._id,
    isActive: true,
  })

  if (!schedule) {
    return res.json({ routine: null, isRestDay: true })
  }

  if (schedule.cycleType === 'weekly') {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    // Convert to our format (0 = Monday, 6 = Sunday)
    const scheduleDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1

    const dayData = schedule.weekDays.find(d => d.dayOfWeek === scheduleDayOfWeek)
    if (dayData && dayData.isRestDay) {
      return res.json({ routine: null, isRestDay: true, scheduleId: schedule._id })
    }
    if (dayData) {
      return res.json({ routine: dayData, isRestDay: false, scheduleId: schedule._id })
    }
  } else if (schedule.cycleType === 'rolling') {
    const cycleDay = schedule.currentRollingDay || 0
    const dayData = schedule.rollingDays.find(d => d.dayIndex === cycleDay)
    
    if (dayData && dayData.isRestDay) {
      return res.json({ routine: null, isRestDay: true, scheduleId: schedule._id, isRolling: true })
    }
    if (dayData) {
      return res.json({ routine: dayData, isRestDay: false, scheduleId: schedule._id, isRolling: true })
    }
  }

  res.json({ routine: null, isRestDay: true, scheduleId: schedule._id })
}))

/**
 * PUT /api/workout-schedules/advance-rolling-day
 */
router.put('/advance-rolling-day', protect, asyncHandler(async (req, res) => {
  const schedule = await WorkoutSchedule.findOne({
    userId: req.user._id,
    isActive: true,
  })

  if (!schedule || schedule.cycleType !== 'rolling') {
    return res.status(400).json({ message: 'No active rolling schedule found' })
  }

  schedule.currentRollingDay = (schedule.currentRollingDay + 1) % schedule.cycleLengthDays
  await schedule.save()

  res.json({ message: 'Rolling day advanced', currentRollingDay: schedule.currentRollingDay })
}))

/**
 * PUT /api/workout-schedules/:id
 * Update a schedule
 */
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const schedule = await WorkoutSchedule.findOne({
    _id: req.params.id,
    userId: req.user._id,
  })

  if (!schedule) {
    return res.status(404).json({ message: 'Schedule not found' })
  }

  const { cycleType, weekDays, cycleLengthDays, rollingDays } = req.body

  if (cycleType) schedule.cycleType = cycleType
  if (cycleType === 'weekly' && weekDays) schedule.weekDays = weekDays
  if (cycleType === 'rolling') {
    if (cycleLengthDays) schedule.cycleLengthDays = cycleLengthDays
    if (rollingDays) schedule.rollingDays = rollingDays
  }

  await schedule.save()
  res.json(schedule)
}))

/**
 * DELETE /api/workout-schedules/:id
 * Delete a schedule
 */
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const schedule = await WorkoutSchedule.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  })

  if (!schedule) {
    return res.status(404).json({ message: 'Schedule not found' })
  }

  res.json({ message: 'Schedule deleted successfully' })
}))

module.exports = router
