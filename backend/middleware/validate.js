// ============================================
//  INPUT VALIDATION & SANITIZATION MIDDLEWARE
//  middleware/validate.js
// ============================================
//
//  WHY VALIDATE ON THE SERVER?
//  The frontend can be bypassed entirely — anyone can
//  send raw HTTP requests with tools like Postman or curl.
//  Server-side validation is the REAL line of defence.
//
//  WHAT IS SANITIZATION?
//  Removing or escaping dangerous characters from user input.
//  For example, stripping HTML tags prevents XSS attacks where
//  someone submits "<script>steal(cookies)</script>" as a meal name.
//
//  HOW THIS FILE WORKS:
//  It exports validator functions that can be used as
//  Express middleware in route files:
//
//    router.post('/meals', protect, validateMeal, handler)
//                                   ↑ runs before handler
// ============================================

/**
 * stripHTML — Removes HTML tags from a string to prevent XSS.
 *
 * Example:
 *   stripHTML('<script>alert("hack")</script>Hello')
 *   → 'Hello'
 *
 * HOW IT WORKS:
 *   The regex /<[^>]*>/g matches anything between < and >,
 *   and replaceAll removes them. We also trim whitespace.
 */
function stripHTML(str) {
  if (typeof str !== 'string') return ''
  return str.replace(/<[^>]*>/g, '').trim()
}

/**
 * clampNumber — Ensures a number is within a safe range.
 *
 * @param {*} val — The value to validate
 * @param {number} min — Minimum allowed value
 * @param {number} max — Maximum allowed value
 * @param {number} fallback — Default if val is not a valid number
 * @returns {number}
 */
function clampNumber(val, min, max, fallback = 0) {
  const num = Number(val)
  if (isNaN(num)) return fallback
  return Math.max(min, Math.min(max, num))
}

// -----------------------------------------------
//  Validators for each route
// -----------------------------------------------

/**
 * validateMeal — Validates meal input
 * Expects: { name: string, calories: number }
 */
function validateMeal(req, res, next) {
  let { name, calories } = req.body

  // Name: required, string, max 100 chars, no HTML
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Meal name is required' })
  }
  name = stripHTML(name).slice(0, 100)

  // Calories: required, positive number, max 10000
  calories = Number(calories)
  if (isNaN(calories) || calories <= 0) {
    return res.status(400).json({ success: false, message: 'Calories must be a positive number' })
  }
  calories = clampNumber(calories, 1, 10000)

  // Overwrite req.body with sanitized values
  req.body.name = name
  req.body.calories = calories
  next()
}

/**
 * validateSport — Validates sport logging input
 * Expects: { name: string, icon: string, met: number, duration: number }
 */
function validateSport(req, res, next) {
  let { name, icon, met, duration } = req.body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Sport name is required' })
  }
  name = stripHTML(name).slice(0, 100)

  // Icon: optional string, max 10 chars (emoji)
  if (icon) icon = stripHTML(String(icon)).slice(0, 10)
  else icon = '🏅'

  // MET: required, 0.5 to 25 (realistic range)
  met = Number(met)
  if (isNaN(met) || met <= 0) {
    return res.status(400).json({ success: false, message: 'MET value must be a positive number' })
  }
  met = clampNumber(met, 0.5, 25)

  // Duration: required, 1 to 600 minutes (10 hours max)
  duration = Number(duration)
  if (isNaN(duration) || duration <= 0) {
    return res.status(400).json({ success: false, message: 'Duration must be a positive number' })
  }
  duration = clampNumber(duration, 1, 600)

  req.body = { name, icon, met, duration }
  next()
}

/**
 * validateWater — Validates water intake input
 * Expects: { ml: number }
 */
function validateWater(req, res, next) {
  let { ml } = req.body

  ml = Number(ml)
  if (isNaN(ml) || ml <= 0) {
    return res.status(400).json({ success: false, message: 'Please provide a positive ml value' })
  }
  // Max 2000ml (2L) in a single log — prevents absurd values
  ml = clampNumber(ml, 1, 2000)

  req.body.ml = ml
  next()
}

/**
 * validateWorkout — Validates adding a custom workout
 * Expects: { name: string, sets?: string, weight?: string, calories?: number }
 */
function validateWorkout(req, res, next) {
  let { name, sets, weight, calories } = req.body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Workout name is required' })
  }
  name = stripHTML(name).slice(0, 100)
  sets = sets ? stripHTML(String(sets)).slice(0, 50) : ''
  weight = weight ? stripHTML(String(weight)).slice(0, 20) : ''
  calories = clampNumber(calories, 0, 5000, 0)

  req.body = { name, sets, weight, calories }
  next()
}

/**
 * validateWorkoutPlan — Validates replacing the workout list
 * Expects: { workouts: Array }
 */
function validateWorkoutPlan(req, res, next) {
  let { workouts } = req.body

  if (!workouts || !Array.isArray(workouts)) {
    return res.status(400).json({ success: false, message: 'workouts array is required' })
  }

  // Max 30 exercises per day — prevents abuse
  if (workouts.length > 30) {
    return res.status(400).json({ success: false, message: 'Maximum 30 exercises per plan' })
  }

  // Sanitize each workout entry
  workouts = workouts.map(w => ({
    name: stripHTML(String(w.name || 'Unnamed')).slice(0, 100),
    sets: stripHTML(String(w.sets || '')).slice(0, 50),
    weight: stripHTML(String(w.weight || '')).slice(0, 20),
    done: false,
    calories: clampNumber(w.calories, 0, 5000, 0),
  }))

  req.body.workouts = workouts
  next()
}

/**
 * validateActivities — Validates daily activity breakdown
 * Expects: { activities: Array }
 */
function validateActivities(req, res, next) {
  let { activities } = req.body

  if (!activities || !Array.isArray(activities)) {
    return res.status(400).json({ success: false, message: 'Please provide an activities array' })
  }

  // Max 20 activities
  if (activities.length > 20) {
    return res.status(400).json({ success: false, message: 'Maximum 20 activities' })
  }

  // Total hours must not exceed 24
  const totalHours = activities.reduce((sum, a) => sum + (Number(a.hours) || 0), 0)
  if (totalHours > 24) {
    return res.status(400).json({ success: false, message: 'Total hours cannot exceed 24' })
  }

  // Sanitize each activity
  activities = activities.map(a => ({
    name: stripHTML(String(a.name || '')).slice(0, 100),
    icon: stripHTML(String(a.icon || '')).slice(0, 10),
    met: clampNumber(a.met, 0.5, 25, 1),
    hours: clampNumber(a.hours, 0, 24, 0),
    color: /^#[0-9a-fA-F]{3,8}$/.test(String(a.color)) ? a.color : '#888',
  }))

  req.body.activities = activities
  next()
}

/**
 * validateProfile — Validates profile update input
 * Expects: { weight, height, age, gender, activityLevel, goal }
 */
function validateProfile(req, res, next) {
  let { weight, height, age, gender, activityLevel, goal } = req.body

  weight = clampNumber(weight, 20, 300, 0)
  height = clampNumber(height, 50, 300, 0)
  age = clampNumber(age, 10, 120, 0)

  // Gender: must be one of the allowed values
  const validGenders = ['male', 'female']
  if (!validGenders.includes(gender)) gender = 'male'

  // Activity level: must be one of the enum values
  const validLevels = ['sedentary', 'light', 'moderate', 'active', 'veryActive']
  if (!validLevels.includes(activityLevel)) activityLevel = 'moderate'

  // Goal: optional string, sanitized
  goal = goal ? stripHTML(String(goal)).slice(0, 100) : ''

  req.body = { weight, height, age, gender, activityLevel, goal }
  next()
}

/**
 * validateAuth — Validates signup input
 */
function validateSignup(req, res, next) {
  let { username, email, password } = req.body

  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    return res.status(400).json({ success: false, message: 'Username must be at least 3 characters' })
  }
  // Only allow alphanumeric, underscores, hyphens — no HTML/scripts
  username = username.trim().slice(0, 30)
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return res.status(400).json({ success: false, message: 'Username can only contain letters, numbers, underscores, and hyphens' })
  }

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, message: 'Email is required' })
  }
  email = email.trim().toLowerCase().slice(0, 100)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' })
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
  }
  if (password.length > 128) {
    return res.status(400).json({ success: false, message: 'Password is too long' })
  }

  req.body = { username, email, password }
  next()
}

/**
 * validateLogin — Validates login input
 */
function validateLogin(req, res, next) {
  let { login, password } = req.body

  if (!login || typeof login !== 'string' || login.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Please provide username or email' })
  }
  login = login.trim().slice(0, 100)

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Please provide your password' })
  }

  req.body = { login, password }
  next()
}

module.exports = {
  stripHTML,
  clampNumber,
  validateMeal,
  validateSport,
  validateWater,
  validateWorkout,
  validateWorkoutPlan,
  validateActivities,
  validateProfile,
  validateSignup,
  validateLogin,
}
