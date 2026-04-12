const mongoose = require('mongoose')

const workoutRoutineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  name: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    default: '',
  },

  exercises: [
    {
      name: { type: String, required: true },
      sets: { type: String }, // e.g., "3", "3-4"
      reps: { type: String }, // e.g., "8-10", "12"
      weight: { type: Number }, // in kg or lbs
      calories: { type: Number, default: 0 },
    },
  ],
}, {
  timestamps: true,
})

module.exports = mongoose.model('WorkoutRoutine', workoutRoutineSchema)
