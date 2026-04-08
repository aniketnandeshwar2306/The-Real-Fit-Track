// ============================================
//  PROGRESS ROUTES — routes/progress.js
// ============================================
//
//  These routes return historical data for charts,
//  trends, and the progress page.
//
//  ROUTES:
//    GET /api/progress        — Get all days (for charts)
//    GET /api/progress/:date  — Get data for a specific date
//
//  LEARNING NOTE:
//  This is the most "read-heavy" route file.
//  It only has GET routes — no creating or updating.
//  Think of it as the "analytics/reporting" part of the API.
// ============================================

const express = require('express')
const router = express.Router()
const DayData = require('../models/DayData')
const { protect } = require('../middleware/auth')

// -----------------------------------------------
//  GET /api/progress
//  Get all historical data for the logged-in user
// -----------------------------------------------
//
//  QUERY PARAMS (optional):
//    ?limit=30  — Only get the last 30 days
//    ?from=2026-01-01&to=2026-03-31 — Date range
//
//  WHAT ARE QUERY PARAMS?
//  They're the part after "?" in a URL.
//  Example: /api/progress?limit=30
//  Access them with: req.query.limit
//
router.get('/', protect, async (req, res) => {
  try {
    const { limit, from, to } = req.query

    // Build the query filter
    // We always filter by user — you can only see YOUR data
    const filter = { user: req.user._id }

    // If date range is provided, add it to the filter
    // $gte = "greater than or equal to"
    // $lte = "less than or equal to"
    if (from || to) {
      filter.date = {}
      if (from) filter.date.$gte = from   // date >= from
      if (to) filter.date.$lte = to       // date <= to
    }

    // Find all matching documents
    // .sort({ date: -1 }) sorts by date descending (newest first)
    // .limit() caps the number of results
    let query = DayData.find(filter).sort({ date: -1 })

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const days = await query

    // Transform to the format the frontend expects:
    // { "2026-04-02": { meals: [...], workouts: [...] }, "2026-04-01": { ... } }
    const daysMap = {}
    days.forEach(day => {
      daysMap[day.date] = {
        caloriesConsumed: day.caloriesConsumed,
        meals: day.meals,
        waterMl: day.waterMl,
        workouts: day.workouts,
        workoutsCompleted: day.workoutsCompleted,
        sports: day.sports,
        activities: day.activities,
      }
    })

    res.json({
      success: true,
      totalDays: days.length,
      days: daysMap,
    })
  } catch (error) {
    console.error('Get progress error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// -----------------------------------------------
//  GET /api/progress/:date
//  Get data for a specific date
// -----------------------------------------------
//
//  URL PARAMS:
//    :date — e.g., "2026-04-02"
//
//  Example: GET /api/progress/2026-04-02
//
router.get('/:date', protect, async (req, res) => {
  try {
    const { date } = req.params

    // Validate date format (basic check)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD',
      })
    }

    const dayData = await DayData.findOne({
      user: req.user._id,
      date,
    })

    if (!dayData) {
      return res.json({
        success: true,
        date,
        data: null,
        message: 'No data recorded for this date',
      })
    }

    res.json({
      success: true,
      date,
      data: {
        caloriesConsumed: dayData.caloriesConsumed,
        meals: dayData.meals,
        waterMl: dayData.waterMl,
        workouts: dayData.workouts,
        workoutsCompleted: dayData.workoutsCompleted,
        sports: dayData.sports,
        activities: dayData.activities,
      },
    })
  } catch (error) {
    console.error('Get day data error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router
