// ============================================
//  DATABASE CONNECTION — config/db.js
// ============================================
//
//  This file connects our Node.js app to MongoDB.
//
//  WHAT IS MONGOOSE?
//  Mongoose is an ODM (Object Data Modeling) library.
//  It lets us define "schemas" (structure) for our data
//  and provides easy methods to read/write to MongoDB.
//
//  WHAT IS AN ODM?
//  Just like how SQL databases have ORMs (like Sequelize),
//  MongoDB has ODMs. They translate between our JavaScript
//  objects and the database documents.
// ============================================

const mongoose = require('mongoose')

/**
 * connectDB — Connects to MongoDB using the URI from .env
 *
 * mongoose.connect() returns a Promise, so we use async/await.
 * If the connection fails, we log the error and exit the process.
 */
async function connectDB() {
  try {
    // mongoose.connect() takes the MongoDB URI and connects to the database.
    // The URI format is: mongodb://<host>:<port>/<database-name>
    // Or for Atlas: mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database-name>
    const conn = await mongoose.connect(process.env.MONGO_URI)

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`)
    // Exit the process with failure code (1)
    // We can't run the app without a database!
    process.exit(1)
  }
}

// Export the function so server.js can use it
module.exports = connectDB
