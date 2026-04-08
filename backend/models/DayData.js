// ============================================
//  DAY DATA MODEL — models/DayData.js
// ============================================
//
//  This model stores one day's worth of fitness data
//  for a specific user. Each document represents ONE day.
//
//  DESIGN DECISION: Why one document per day?
//  - Easy to query: "Give me all data for 2026-04-02"
//  - Matches the frontend's data structure (data.days["2026-04-02"])
//  - Each day has meals, workouts, water, sports, activities
//
//  WHAT ARE SUBDOCUMENTS?
//  In MongoDB, arrays of objects are called "subdocuments".
//  For example, `meals` is an array of meal subdocuments.
//  Each meal has its own fields (name, calories, time).
//  Unlike SQL, we don't need a separate "meals" table!
// ============================================

const mongoose = require('mongoose')

// -----------------------------------------------
//  Sub-schemas (blueprints for nested objects)
// -----------------------------------------------

// Each meal logged by the user
const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },       // e.g., "Chicken Rice"
  calories: { type: Number, required: true },   // e.g., 450
  time: { type: String },                       // e.g., "12:30 PM"
}, { _id: false })  // _id: false → don't create an _id for each meal (saves space)

// Each workout exercise
const workoutSchema = new mongoose.Schema({
  name: { type: String, required: true },       // e.g., "Bench Press"
  sets: { type: String },                       // e.g., "4 × 10 reps"
  weight: { type: String },                     // e.g., "70kg" or "bodyweight"
  done: { type: Boolean, default: false },      // Has the user completed it?
  calories: { type: Number, default: 0 },       // Estimated calories burned
}, { _id: false })

// Each sport activity (cricket, football, etc.)
const sportSchema = new mongoose.Schema({
  name: { type: String, required: true },       // e.g., "Cricket"
  icon: { type: String },                       // e.g., "🏏"
  met: { type: Number },                        // MET value for calorie calculation
  duration: { type: Number },                   // Duration in minutes
  calories: { type: Number },                   // Calculated calories burned
  time: { type: String },                       // Time when logged
}, { _id: false })

// Each daily activity (sleeping, walking, studying, etc.)
const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },       // e.g., "Sleeping"
  icon: { type: String },                       // e.g., "😴"
  met: { type: Number },                        // MET value
  hours: { type: Number },                      // Hours spent
  calories: { type: Number },                   // Calculated calories
  color: { type: String },                      // Color for UI display
}, { _id: false })

// -----------------------------------------------
//  Main DayData Schema
// -----------------------------------------------
const dayDataSchema = new mongoose.Schema({

  // Reference to the User who owns this data
  // This is like a "foreign key" in SQL databases
  user: {
    type: mongoose.Schema.Types.ObjectId,  // Special type for MongoDB IDs
    ref: 'User',                            // References the 'User' model
    required: true,
  },

  // The date this data belongs to (format: "YYYY-MM-DD")
  date: {
    type: String,
    required: true,
  },

  // --- Nutrition ---
  caloriesConsumed: { type: Number, default: 0 },
  meals: [mealSchema],          // Array of meal subdocuments
  waterMl: { type: Number, default: 0 },

  // --- Exercise ---
  workouts: [workoutSchema],    // Array of workout subdocuments
  workoutsCompleted: { type: Number, default: 0 },

  // --- Sports & Activities ---
  sports: [sportSchema],        // Array of sport subdocuments
  activities: [activitySchema], // Array of activity subdocuments

}, {
  timestamps: true,  // Adds createdAt, updatedAt
})

// -----------------------------------------------
//  COMPOUND INDEX
// -----------------------------------------------
//
//  WHAT IS AN INDEX?
//  An index makes database queries faster.
//  Think of it like a book's index — instead of reading
//  every page, you jump directly to what you need.
//
//  COMPOUND INDEX: { user, date }
//  This creates a combined index on user + date.
//  - Makes queries like "find data for user X on date Y" super fast
//  - The 'unique' option ensures one document per user per day
//
dayDataSchema.index({ user: 1, date: 1 }, { unique: true })

module.exports = mongoose.model('DayData', dayDataSchema)
