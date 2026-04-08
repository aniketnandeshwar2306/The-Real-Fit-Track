// ============================================
//  USER MODEL — models/User.js
// ============================================
//
//  WHAT IS A MODEL?
//  A model is a blueprint for how data looks in MongoDB.
//  Think of it like a class — it defines the shape (schema)
//  of every "User" document stored in the database.
//
//  WHAT IS A SCHEMA?
//  A schema defines:
//    - What fields a document has (username, email, etc.)
//    - What type each field is (String, Number, etc.)
//    - Validation rules (required, unique, min length, etc.)
//
//  WHAT IS A DOCUMENT?
//  A document is one record in MongoDB (like one row in SQL).
//  Example: { username: "aniket", email: "aniket@gmail.com", ... }
// ============================================

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// -----------------------------------------------
//  Define the Schema
// -----------------------------------------------
const userSchema = new mongoose.Schema({
  // --- Authentication Fields ---

  username: {
    type: String,         // Data type
    required: true,       // This field is mandatory
    unique: true,         // No two users can have the same username
    trim: true,           // Removes whitespace from both ends
    minlength: 3,         // Must be at least 3 characters
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,      // Converts to lowercase before saving
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  // --- Fitness Profile (embedded object) ---
  // This matches the "profile" data from the React frontend.
  // In MongoDB, we can nest objects directly inside a document!
  profile: {
    weight: { type: Number, default: 0 },      // in kg
    height: { type: Number, default: 0 },      // in cm
    age: { type: Number, default: 0 },
    gender: { type: String, enum: ['male', 'female'], default: 'male' },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'veryActive'],
      default: 'moderate',
    },
    goal: { type: String, default: '' },        // e.g., "lose weight", "gain muscle"
    waterGoal: { type: Number, default: 3000 }, // daily water intake in ml
    calorieTarget: { type: Number, default: null }, // null = auto-TDEE, else custom cal target
    dailyWorkoutTarget: { type: Number, default: 1 }, // target workouts per day
  },

}, {
  // --- Schema Options ---
  timestamps: true,  // Automatically adds createdAt and updatedAt fields
})

// -----------------------------------------------
//  MIDDLEWARE: Hash password before saving
// -----------------------------------------------
//
//  WHAT IS MIDDLEWARE (pre/post hooks)?
//  Mongoose middleware runs automatically before or after
//  certain operations. Here, we run code BEFORE saving.
//
//  WHY HASH PASSWORDS?
//  We NEVER store plain text passwords. If the database is
//  hacked, attackers would see everyone's passwords.
//  Hashing converts "mypassword" → "$2a$10$xK3j..." (irreversible).
//
//  HOW bcrypt WORKS:
//  1. genSalt(10) — creates a random "salt" (extra randomness)
//     The number 10 is the "cost factor" (higher = slower but safer)
//  2. hash(password, salt) — combines password + salt → hash
//
userSchema.pre('save', async function () {
  // Only hash the password if it has been modified (or is new)
  // This prevents re-hashing when we update other fields like profile
  if (!this.isModified('password')) return

  // Generate a salt with 10 rounds
  const salt = await bcrypt.genSalt(10)

  // Hash the password with the salt
  this.password = await bcrypt.hash(this.password, salt)
})

// -----------------------------------------------
//  INSTANCE METHOD: Compare passwords
// -----------------------------------------------
//
//  WHAT IS AN INSTANCE METHOD?
//  A function we can call on any User document.
//  Example: const isMatch = await user.comparePassword('mypassword')
//
//  bcrypt.compare() takes the plain text password and the stored hash,
//  and tells us if they match (true/false).
//
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// -----------------------------------------------
//  Create and Export the Model
// -----------------------------------------------
//
//  mongoose.model('User', userSchema) does two things:
//  1. Creates a "User" model from our schema
//  2. MongoDB will store documents in a collection called "users"
//     (Mongoose automatically lowercases and pluralizes the name)
//
module.exports = mongoose.model('User', userSchema)
