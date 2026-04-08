// ============================================
//  WORKOUT ROUTES — routes/workouts.js
// ============================================
//
//  These routes handle the gym workout functionality:
//    - Get today's workouts
//    - Add a custom workout
//    - Toggle a workout as done/not done
//    - Update a workout's weight
//    - Delete a workout
//    - Replace all workouts with a plan
//
//  HELPER: getOrCreateToday()
//  Many routes need "today's data". This helper function
//  either finds existing data or creates a new document.
// ============================================

const express = require('express')
const router = express.Router()
const DayData = require('../models/DayData')
const { protect } = require('../middleware/auth')
const { validateWorkout, validateWorkoutPlan } = require('../middleware/validate')
const { getTodayKey } = require('../utils/dateHelper')
const asyncHandler = require('../utils/asyncHandler')

// Default workouts — same as the frontend
const DEFAULT_WORKOUTS = [
  { name: 'Bench Press', sets: '4 × 10 reps', weight: '70kg', done: false, calories: 120 },
  { name: 'Overhead Press', sets: '3 × 12 reps', weight: '35kg', done: false, calories: 90 },
  { name: 'Incline Dumbbell Press', sets: '3 × 12 reps', weight: '22kg', done: false, calories: 85 },
  { name: 'Tricep Dips', sets: '3 × 15 reps', weight: 'bodyweight', done: false, calories: 70 },
  { name: 'Lateral Raises', sets: '4 × 15 reps', weight: '10kg', done: false, calories: 55 },
]

/**
 * getOrCreateToday — Finds or creates today's DayData document
 *
 * This uses findOneAndUpdate with the 'upsert' option:
 *   - If a document for today EXISTS → returns it (no changes)
 *   - If NO document exists → creates one with defaults
 *
 * WHAT IS UPSERT?
 *   "upsert" = "update" + "insert"
 *   It's a smart operation:
 *     - Found? → Update it
 *     - Not found? → Insert (create) it
 *
 * $setOnInsert only sets these fields when CREATING (not updating).
 * This way, existing data isn't overwritten.
 */
async function getOrCreateToday(userId) {
  return DayData.findOneAndUpdate(
    { user: userId, date: getTodayKey() },     // Find condition
    {
      $setOnInsert: {                           // Only set these on creation
        caloriesConsumed: 0,
        meals: [],
        waterMl: 0,
        workouts: DEFAULT_WORKOUTS,
        workoutsCompleted: 0,
        sports: [],
        activities: [],
      },
    },
    { new: true, upsert: true }                // Return new doc, create if missing
  )
}

// -----------------------------------------------
//  GET /api/workouts
//  Get today's workout list
// -----------------------------------------------
router.get('/', protect, async (req, res) => {
  try {
    const today = await getOrCreateToday(req.user._id)

    res.json({
      success: true,
      date: today.date,
      workouts: today.workouts,
      workoutsCompleted: today.workoutsCompleted,
    })
  } catch (error) {
    console.error('Get workouts error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// -----------------------------------------------
//  POST /api/workouts
//  Add a custom workout to today's list
// -----------------------------------------------
//
//  REQUEST BODY:
//  {
//    "name": "Barbell Squats",
//    "sets": "4 × 8 reps",
//    "weight": "80kg",
//    "calories": 150
//  }
//
router.post('/', protect, validateWorkout, async (req, res) => {
  try {
    // req.body has been validated and sanitized by validateWorkout
    const { name, sets, weight, calories } = req.body

    // $push adds an element to an array
    // This is like JavaScript's array.push() but for MongoDB
    const today = await DayData.findOneAndUpdate(
      { user: req.user._id, date: getTodayKey() },
      {
        $push: {
          workouts: { name, sets: sets || '', weight: weight || '', done: false, calories: calories || 0 },
        },
      },
      { new: true, upsert: true }
    )

    res.status(201).json({
      success: true,
      message: `${name} added to today's workouts!`,
      workouts: today.workouts,
    })
  } catch (error) {
    console.error('Add workout error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// -----------------------------------------------
//  PUT /api/workouts/:index/toggle
//  Toggle a workout's done status
// -----------------------------------------------
//
//  URL PARAMS:
//    :index — the position of the workout in the array (0-based)
//
//  WHAT ARE URL PARAMS?
//  In Express, :index in the URL becomes req.params.index
//  Example: PUT /api/workouts/2/toggle → req.params.index = "2"
//
router.put('/:index/toggle', protect, async (req, res) => {
  try {
    const index = parseInt(req.params.index)
    const today = await getOrCreateToday(req.user._id)

    // Validate the index
    if (index < 0 || index >= today.workouts.length) {
      return res.status(400).json({ success: false, message: 'Invalid workout index' })
    }

    // Toggle the done status
    today.workouts[index].done = !today.workouts[index].done

    // Recalculate completed count
    today.workoutsCompleted = today.workouts.filter(w => w.done).length

    // Save the changes
    // .save() writes the modified document back to the database
    await today.save()

    res.json({
      success: true,
      message: `${today.workouts[index].name} ${today.workouts[index].done ? 'completed ✅' : 'uncompleted'}`,
      workouts: today.workouts,
      workoutsCompleted: today.workoutsCompleted,
    })
  } catch (error) {
    console.error('Toggle workout error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// -----------------------------------------------
//  PUT /api/workouts/:index/weight
//  Update a workout's weight
// -----------------------------------------------
//
//  REQUEST BODY:
//  { "weight": "75kg" }
//
router.put('/:index/weight', protect, async (req, res) => {
  try {
    const index = parseInt(req.params.index)
    const { weight } = req.body
    const today = await getOrCreateToday(req.user._id)

    if (index < 0 || index >= today.workouts.length) {
      return res.status(400).json({ success: false, message: 'Invalid workout index' })
    }

    today.workouts[index].weight = weight
    await today.save()

    res.json({
      success: true,
      message: `Weight updated to ${weight}`,
      workout: today.workouts[index],
    })
  } catch (error) {
    console.error('Update weight error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// -----------------------------------------------
//  DELETE /api/workouts/:index
//  Remove a workout from today's list
// -----------------------------------------------
router.delete('/:index', protect, async (req, res) => {
  try {
    const index = parseInt(req.params.index)
    const today = await getOrCreateToday(req.user._id)

    if (index < 0 || index >= today.workouts.length) {
      return res.status(400).json({ success: false, message: 'Invalid workout index' })
    }

    const removed = today.workouts[index].name

    // splice() removes elements from an array (same as JavaScript)
    today.workouts.splice(index, 1)
    today.workoutsCompleted = today.workouts.filter(w => w.done).length
    await today.save()

    res.json({
      success: true,
      message: `${removed} removed from workouts`,
      workouts: today.workouts,
    })
  } catch (error) {
    console.error('Delete workout error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// -----------------------------------------------
//  PUT /api/workouts/plan
//  Replace all workouts with a new plan
// -----------------------------------------------
//
//  REQUEST BODY:
//  {
//    "workouts": [
//      { "name": "Squats", "sets": "5 × 5 reps", "weight": "100kg", "calories": 200 },
//      { "name": "Deadlift", "sets": "3 × 5 reps", "weight": "120kg", "calories": 250 }
//    ]
//  }
//
router.put('/plan', protect, validateWorkoutPlan, async (req, res) => {
  try {
    // req.body has been validated and sanitized by validateWorkoutPlan
    const { workouts } = req.body

    const today = await getOrCreateToday(req.user._id)
    today.workouts = workouts.map(w => ({ ...w, done: false }))
    today.workoutsCompleted = 0
    await today.save()

    res.json({
      success: true,
      message: 'Workout plan loaded!',
      workouts: today.workouts,
    })
  } catch (error) {
    console.error('Set plan error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router
