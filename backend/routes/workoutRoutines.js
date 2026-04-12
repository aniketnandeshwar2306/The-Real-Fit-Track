const express = require('express')
const router = express.Router()
const WorkoutRoutine = require('../models/WorkoutRoutine')
const { protect } = require('../middleware/auth')
const asyncHandler = require('../utils/asyncHandler')

/**
 * POST /api/workout-routines
 * Create a new workout routine
 */
router.post('/', protect, asyncHandler(async (req, res) => {
  const { name, description, exercises } = req.body

  if (!name) {
    return res.status(400).json({ message: 'Routine name is required' })
  }

  const routine = new WorkoutRoutine({
    userId: req.user.id,
    name,
    description,
    exercises: exercises || [],
  })

  await routine.save()
  res.status(201).json(routine)
}))

/**
 * GET /api/workout-routines
 * Get all routines for the logged-in user
 */
router.get('/', protect, asyncHandler(async (req, res) => {
  const routines = await WorkoutRoutine.find({ userId: req.user.id }).sort({ createdAt: -1 })
  res.json(routines)
}))

/**
 * GET /api/workout-routines/:id
 * Get a specific routine by ID
 */
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const routine = await WorkoutRoutine.findOne({
    _id: req.params.id,
    userId: req.user.id,
  })

  if (!routine) {
    return res.status(404).json({ message: 'Routine not found' })
  }

  res.json(routine)
}))

/**
 * PUT /api/workout-routines/:id
 * Update a routine
 */
router.put('/:id', protect, asyncHandler(async (req, res) => {
  let routine = await WorkoutRoutine.findOne({
    _id: req.params.id,
    userId: req.user.id,
  })

  if (!routine) {
    return res.status(404).json({ message: 'Routine not found' })
  }

  const { name, description, exercises } = req.body

  if (name) routine.name = name
  if (description !== undefined) routine.description = description
  if (exercises) routine.exercises = exercises

  await routine.save()
  res.json(routine)
}))

/**
 * DELETE /api/workout-routines/:id
 * Delete a routine
 */
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const routine = await WorkoutRoutine.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  })

  if (!routine) {
    return res.status(404).json({ message: 'Routine not found' })
  }

  res.json({ message: 'Routine deleted successfully' })
}))

module.exports = router
