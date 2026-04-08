// ============================================
//  ASYNC HANDLER — utils/asyncHandler.js
// ============================================
//
//  WHAT IS THIS?
//  A wrapper that eliminates the need for try/catch
//  in every single route handler.
//
//  BEFORE (repetitive):
//    router.get('/', protect, async (req, res) => {
//      try {
//        // ... your logic
//      } catch (error) {
//        console.error('Error:', error)
//        res.status(500).json({ success: false, message: error.message })
//      }
//    })
//
//  AFTER (clean):
//    router.get('/', protect, asyncHandler(async (req, res) => {
//      // ... your logic (errors auto-caught!)
//    }))
//
//  HOW IT WORKS:
//  asyncHandler wraps your function in a try/catch.
//  If the function throws an error, it calls next(error),
//  which passes the error to Express's error-handling middleware
//  (defined in server.js).
//
//  This is a very common pattern in production Express apps.
//  Many popular frameworks (like NestJS) do this automatically.
// ============================================

/**
 * asyncHandler — Wraps an async route handler to auto-catch errors.
 *
 * @param {Function} fn — The async route handler function
 * @returns {Function} — A new function that catches errors and passes them to next()
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    // Promise.resolve() ensures fn() is treated as a Promise
    // .catch(next) passes any error to Express's error middleware
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

module.exports = asyncHandler
