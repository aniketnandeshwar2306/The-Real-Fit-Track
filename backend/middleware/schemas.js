// ============================================
//  VALIDATION SCHEMAS — middleware/schemas.js
// ============================================
//
//  Uses Joi to define validation schemas for all inputs.
//  This provides:
//    - Type checking
//    - Required field validation
//    - Range/length validation
//    - Regex pattern validation
//    - Custom error messages
//
//  Schema is used like:
//    const result = signupSchema.validate(req.body)
//    if (result.error) return res.status(400).json({ ... })

const Joi = require('joi')

// Common reusable patterns
const patterns = {
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({ 'any.required': 'Email is required' }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required',
    }),

  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username can only contain letters and numbers',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username must be at most 30 characters',
      'any.required': 'Username is required',
    }),

  positiveNumber: (fieldName) =>
    Joi.number()
      .positive()
      .required()
      .messages({
        'number.positive': `${fieldName} must be a positive number`,
        'any.required': `${fieldName} is required`,
      }),

  nonNegativeNumber: (fieldName) =>
    Joi.number()
      .min(0)
      .required()
      .messages({
        'number.min': `${fieldName} must be at least 0`,
        'any.required': `${fieldName} is required`,
      }),

  stringField: (fieldName, max = 255) =>
    Joi.string()
      .trim()
      .max(max)
      .required()
      .messages({
        'string.max': `${fieldName} must be at most ${max} characters`,
        'any.required': `${fieldName} is required`,
      }),
}

// Signup validation
const signupSchema = Joi.object({
  username: patterns.username,
  email: patterns.email,
  password: patterns.password,
}).unknown(false) // Reject unknown fields

// Login validation
const loginSchema = Joi.object({
  login: Joi.string()
    .trim()
    .required()
    .messages({
      'any.required': 'Email or username is required',
      'string.empty': 'Email or username is required',
    }),
  password: patterns.password,
}).unknown(false)

// Profile update validation
const profileSchema = Joi.object({
  age: Joi.number().integer().min(1).max(150).required(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  weight: Joi.number().positive().required().messages({
    'number.positive': 'Weight must be positive',
  }),
  height: Joi.number().positive().required().messages({
    'number.positive': 'Height must be positive',
  }),
  activityLevel: Joi.string()
    .valid('sedentary', 'light', 'moderate', 'active', 'veryActive')
    .required(),
}).unknown(false)

// Meal validation
const mealSchema = Joi.object({
  name: patterns.stringField('Meal name', 100),
  calories: patterns.positiveNumber('Calories'),
}).unknown(false)

// Water validation
const waterSchema = Joi.object({
  ml: patterns.nonNegativeNumber('Water amount (ml)'),
}).unknown(false)

// Workout validation
const workoutSchema = Joi.object({
  name: patterns.stringField('Exercise name', 100),
  sets: Joi.number().integer().positive().required(),
  reps: Joi.number().integer().positive().required(),
  weight: patterns.nonNegativeNumber('Weight'),
}).unknown(false)

// Sport validation
const sportSchema = Joi.object({
  name: patterns.stringField('Sport name', 100),
  icon: Joi.string().max(10).optional(),
  met: patterns.positiveNumber('MET value'),
  duration: patterns.positiveNumber('Duration (minutes)'),
}).unknown(false)

// Activity validation
const activitySchema = Joi.object({
  name: patterns.stringField('Activity name', 100),
  icon: Joi.string().max(10).optional(),
  met: patterns.positiveNumber('MET value'),
  color: Joi.string().pattern(/^#[0-9a-fA-F]{3,8}$/).optional().messages({
    'string.pattern.base': 'Color must be a valid hex color (#RGB, #RRGGBB, or #RRGGBBAA)',
  }),
}).unknown(false)

module.exports = {
  signupSchema,
  loginSchema,
  profileSchema,
  mealSchema,
  waterSchema,
  workoutSchema,
  sportSchema,
  activitySchema,
}
