const express = require('express')
const router = express.Router()
const WorkoutSchedule = require('../models/WorkoutSchedule')
const WorkoutRoutine = require('../models/WorkoutRoutine')
const { protect } = require('../middleware/auth')
const asyncHandler = require('../utils/asyncHandler')

/**
 * POST /api/workout-schedules
 * Create a new schedule (and deactivate previous)
 */
router.post('/', protect, asyncHandler(async (req, res) => {
  const { cycleType, weekDays, cycleLengthWeeks, weeks } = req.body

  if (!cycleType || !['weekly', 'custom'].includes(cycleType)) {
    return res.status(400).json({ message: 'Valid cycleType is required (weekly or custom)' })
  }

  // Deactivate previous active schedule
  await WorkoutSchedule.updateMany(
    { userId: req.user.id, isActive: true },
    { isActive: false }
  )

  const schedule = new WorkoutSchedule({
    userId: req.user.id,
    cycleType,
    isActive: true,
    weekDays: cycleType === 'weekly' ? weekDays : [],
    cycleLengthWeeks: cycleType === 'custom' ? cycleLengthWeeks : 1,
    weeks: cycleType === 'custom' ? weeks : [],
    currentCycleStartDate: new Date(),
  })

  await schedule.save()

  // Populate routine details
  await schedule.populate('weekDays.routineId')
  if (cycleType === 'custom') {
    // TODO: Populate nested weeks array if needed for deep detail
  }

  res.status(201).json(schedule)
}))

/**
 * GET /api/workout-schedules
 * Get the active schedule for the logged-in user
 */
router.get('/', protect, asyncHandler(async (req, res) => {
  const schedule = await WorkoutSchedule.findOne({
    userId: req.user.id,
    isActive: true,
  }).populate('weekDays.routineId')

  if (!schedule) {
    return res.json(null)
  }

  res.json(schedule)
}))

/**
 * GET /api/workout-schedules/today
 * Get the routine assigned to today
 */
router.get('/today-routine/get', protect, asyncHandler(async (req, res) => {
  const schedule = await WorkoutSchedule.findOne({
    userId: req.user.id,
    isActive: true,
  }).populate('weekDays.routineId')

  if (!schedule) {
    return res.json({ routine: null, isRestDay: true })
  }

  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
  // Convert to our format (0 = Monday, 6 = Sunday)
  const scheduleDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  if (schedule.cycleType === 'weekly') {
    const dayData = schedule.weekDays.find(d => d.dayOfWeek === scheduleDayOfWeek)
    if (dayData && dayData.isRestDay) {
      return res.json({ routine: null, isRestDay: true })
    }
    if (dayData && dayData.routineId) {
      return res.json({ routine: dayData.routineId, isRestDay: false })
    }
  } else if (schedule.cycleType === 'custom') {
    const daysSinceStart = Math.floor((today - schedule.currentCycleStartDate) / (1000 * 60 * 60 * 24))
    const dayOfCycle = daysSinceStart % (schedule.cycleLengthWeeks * 7)
    const weekOfCycle = Math.floor(dayOfCycle / 7)
    const dayInWeek = dayOfCycle % 7

    if (schedule.weeks[weekOfCycle]) {
      const dayData = schedule.weeks[weekOfCycle].find(d => d.dayOfWeek === dayInWeek)
      if (dayData && dayData.isRestDay) {
        return res.json({ routine: null, isRestDay: true })
      }
      if (dayData && dayData.routineId) {
        // Populate the routine
        const routine = await WorkoutRoutine.findById(dayData.routineId)
        return res.json({ routine, isRestDay: false })
      }
    }
  }

  res.json({ routine: null, isRestDay: true })
}))

/**
 * PUT /api/workout-schedules/:id
 * Update a schedule
 */
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const schedule = await WorkoutSchedule.findOne({
    _id: req.params.id,
    userId: req.user.id,
  })

  if (!schedule) {
    return res.status(404).json({ message: 'Schedule not found' })
  }

  const { cycleType, weekDays, cycleLengthWeeks, weeks } = req.body

  if (cycleType) schedule.cycleType = cycleType
  if (cycleType === 'weekly' && weekDays) schedule.weekDays = weekDays
  if (cycleType === 'custom') {
    if (cycleLengthWeeks) schedule.cycleLengthWeeks = cycleLengthWeeks
    if (weeks) schedule.weeks = weeks
  }

  await schedule.save()
  await schedule.populate('weekDays.routineId')

  res.json(schedule)
}))

/**
 * DELETE /api/workout-schedules/:id
 * Delete a schedule
 */
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const schedule = await WorkoutSchedule.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  })

  if (!schedule) {
    return res.status(404).json({ message: 'Schedule not found' })
  }

  res.json({ message: 'Schedule deleted successfully' })
}))

module.exports = router
