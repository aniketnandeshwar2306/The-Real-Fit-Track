const mongoose = require('mongoose')

const workoutScheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  cycleType: {
    type: String,
    enum: ['weekly', 'rolling'],
    required: true,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  // For weekly cycles:
  weekDays: [
    {
      dayOfWeek: { type: Number, min: 0, max: 6 }, // 0 = Monday, 6 = Sunday
      name: { type: String, default: '' }, // e.g., 'Chest & Triceps'
      isRestDay: { type: Boolean, default: false },
      exercises: [
        {
          name: String,
          sets: String,
          reps: String,
          weight: String,
        }
      ]
    },
  ],

  // For rolling N-day cycles:
  cycleLengthDays: {
    type: Number,
    default: 3,
  },
  
  currentRollingDay: {
    type: Number,
    default: 0, // Points to the index in rollingDays array currently active
  },

  rollingDays: [
    {
      dayIndex: { type: Number },
      name: { type: String, default: '' },
      isRestDay: { type: Boolean, default: false },
      exercises: [
        {
          name: String,
          sets: String,
          reps: String,
          weight: String,
        }
      ]
    },
  ],
}, {
  timestamps: true,
})

module.exports = mongoose.model('WorkoutSchedule', workoutScheduleSchema)
