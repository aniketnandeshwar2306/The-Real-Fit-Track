// ============================================
//  VALIDATION MIDDLEWARE — middleware/validators.js
// ============================================
//
//  This middleware validates request bodies using Joi schemas
//  and passes to the error handler if validation fails.
//
//  Usage:
//    const { validateRequest } = require('../middleware/validators')
//    const { signupSchema } = require('../middleware/schemas')
//
//    router.post('/signup', validateRequest(signupSchema), handler)

const AppError = require('../utils/AppError')

/**
 * validateRequest — Validates req.body against a Joi schema
 *
 * @param {Joi.Schema} schema — The Joi schema to validate against
 * @returns {Function} — Middleware function
 */
function validateRequest(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Show ALL validation errors, not just first
      stripUnknown: true, // Remove fields not in schema
    })

    if (error) {
      // Format validation errors for the response
      const messages = error.details.map((detail) => detail.message)
      return next(
        new AppError(`Validation failed: ${messages.join('; ')}`, 400, 'VALIDATION_ERROR')
      )
    }

    // Replace req.body with validated/sanitized data
    req.body = value
    next()
  }
}

module.exports = { validateRequest }
