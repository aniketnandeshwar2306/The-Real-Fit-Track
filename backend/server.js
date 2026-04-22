// ============================================
//  FITTRACK SERVER — server.js (Entry Point)
// ============================================
//
//  This is the main file that starts the entire backend.
//  Run it with: node server.js (or npm run dev for auto-reload)
//
//  WHAT HAPPENS WHEN THE SERVER STARTS:
//    1. Load environment variables from .env
//    2. Connect to MongoDB
//    3. Set up Express middleware (CORS, JSON parsing)
//    4. Register all API routes
//    5. Start listening on a port (default 5000)
//
//  WHAT IS EXPRESS?
//  Express is a web framework for Node.js.
//  It helps us:
//    - Create a server
//    - Define routes (URL → function mapping)
//    - Parse request data
//    - Send responses
//  Think of it as the "React" of backend — the most popular
//  framework that makes building servers much easier.
// ============================================

// -----------------------------------------------
//  1. Load Environment Variables
// -----------------------------------------------
//
//  dotenv reads the .env file and puts its variables
//  into process.env (a Node.js global object).
//
//  After this line, we can use:
//    process.env.MONGO_URI
//    process.env.JWT_SECRET
//    process.env.PORT
//
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/errorHandler')

// Import route files
const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')
const workoutRoutes = require('./routes/workouts')
const mealRoutes = require('./routes/meals')
const waterRoutes = require('./routes/water')
const sportRoutes = require('./routes/sports')
const activityRoutes = require('./routes/activities')
const progressRoutes = require('./routes/progress')
const todayRoutes = require('./routes/today')
const workoutRoutineRoutes = require('./routes/workoutRoutines')
const workoutScheduleRoutes = require('./routes/workoutSchedules')

// -----------------------------------------------
//  2. Connect to MongoDB
//  (Called inside startServer() at the bottom)
// -----------------------------------------------

// -----------------------------------------------
//  3. Create the Express App
// -----------------------------------------------
const app = express()

// -----------------------------------------------
//  4. Set up Middleware
// -----------------------------------------------
//
//  WHAT IS MIDDLEWARE? (Again, it's important!)
//  Middleware runs on EVERY request before your routes.
//  Think of it as a pipeline:
//
//    Request → [CORS] → [JSON Parser] → [Your Route] → Response
//

// HELMET — Security Headers
//
// WHAT IS HELMET?
// Helmet sets various HTTP headers to help protect the app:
//   - X-Content-Type-Options: nosniff (prevents MIME type sniffing)
//   - X-Frame-Options: DENY (prevents clickjacking)
//   - Strict-Transport-Security (forces HTTPS in production)
//   - And many more security headers automatically
//
app.use(helmet())

// CORS — Cross-Origin Resource Sharing
//
// WHAT IS CORS?
// By default, browsers block requests from one domain to another.
// If your React app is on localhost:5173 and your API is on
// localhost:5000, the browser will block the request.
//
// SECURITY: Instead of allowing ALL origins with cors(),
// we whitelist only our frontend URLs. This prevents
// malicious websites from making API calls with a user's token.
//
const allowedOrigins = [
  // Development
  'http://localhost:5173',   // Vite dev server
  'http://localhost:5174',   // Vite dev server
  'http://localhost:5175',   // Vite dev server
  'http://localhost:5176',   // Vite dev server
  'http://localhost:4173',   // Vite preview
  'http://localhost:3000',   // Alternative dev port
  // Production
  'https://fittrack.vercel.app',  // Main production domain (update if needed)
]

// Add custom frontend URL if configured in environment
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL)
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true)

    // Check if origin is in allowedOrigins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    // Allow Vercel preview deployments (*.vercel.app)
    if (origin && origin.includes('.vercel.app')) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,  // Allow cookies/auth headers
}))

// JSON Parser with size limit
//
// express.json() parses incoming JSON request bodies.
// Without this, req.body would be undefined!
//
// SECURITY: We limit the body size to 1MB to prevent
// attackers from sending huge payloads that could crash
// or slow down the server (denial-of-service).
//
app.use(express.json({ limit: '1mb' }))

// -----------------------------------------------
//  RATE LIMITING
// -----------------------------------------------
//
// WHAT IS RATE LIMITING?
// Rate limiting restricts how many requests a user can make
// in a given time window. This prevents:
//   - Brute-force attacks on login (trying thousands of passwords)
//   - Denial-of-service (flooding the server with requests)
//   - API abuse (scraping data too fast)
//
// We apply a strict limit on auth routes and a general limit on all routes.
//

// General rate limit: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // Max 100 requests per window
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,      // Return rate limit info in headers
  legacyHeaders: false,
})

// Auth rate limit: 15 attempts per 15 minutes per IP
// Much stricter — prevents password brute-forcing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 15,                    // Max 15 login/signup attempts
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 15 minutes before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Apply general limiter to all API routes
app.use('/api', generalLimiter)

// -----------------------------------------------
//  5. Register Routes
// -----------------------------------------------
app.use('/api/auth', authLimiter, authRoutes)  // Extra strict rate limit on auth
app.use('/api/profile', profileRoutes)
app.use('/api/workouts', workoutRoutes)
app.use('/api/workout-routines', workoutRoutineRoutes)
app.use('/api/workout-schedules', workoutScheduleRoutes)
app.use('/api/meals', mealRoutes)
app.use('/api/water', waterRoutes)
app.use('/api/sports', sportRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/today', todayRoutes)

// -----------------------------------------------
//  6. Health Check Route
// -----------------------------------------------
app.get('/', (req, res) => {
  res.json({
    message: '🏋️ FitTrack API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth (signup, login, me)',
      profile: '/api/profile (update profile)',
      workouts: '/api/workouts (CRUD + toggle + plan)',
      meals: '/api/meals (log + get meals)',
      water: '/api/water (log water)',
      sports: '/api/sports (log sports)',
      activities: '/api/activities (set daily activities)',
      progress: '/api/progress (historical data)',
    },
  })
})

// -----------------------------------------------
//  7. 404 Handler (must come BEFORE error handler)
// -----------------------------------------------
// For 404 routes — handles any request that didn't match a route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  })
})

// -----------------------------------------------
//  8. Error Handling Middleware (must come LAST)
// -----------------------------------------------
// IMPORTANT: This must be LAST! Express recognizes error handlers
// by having 4 parameters: (err, req, res, next)
// It catches all errors thrown or passed via next(error)
app.use(errorHandler)

// -----------------------------------------------
//  9. Start the Server
// -----------------------------------------------
const PORT = process.env.PORT || 5000

async function startServer() {
  try {
    // Wait for database connection before starting the server
    await connectDB()

    app.listen(PORT, () => {
      console.log('')
      console.log('===========================================')
      console.log(`  🏋️  FitTrack API Server`)
      console.log(`  📡 Running on: http://localhost:${PORT}`)
      console.log(`  🔑 Auth:       POST /api/auth/signup`)
      console.log(`  🔑 Auth:       POST /api/auth/login`)
      console.log(`  💪 Workouts:   /api/workouts`)
      console.log(`  🍛 Meals:      /api/meals`)
      console.log(`  💧 Water:      /api/water`)
      console.log(`  🏏 Sports:     /api/sports`)
      console.log(`  📊 Progress:   /api/progress`)
      console.log('===========================================')
      console.log('')
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error.message)
    process.exit(1)
  }
}

startServer()
