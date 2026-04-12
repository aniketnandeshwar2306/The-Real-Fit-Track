const mongoose = require('mongoose')

const workoutScheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  cycleType: {
    type: String,
    enum: ['weekly', 'custom'],
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
      routineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkoutRoutine',
        default: null, // null means rest day
      },
      isRestDay: { type: Boolean, default: false },
    },
  ],

  // For custom multi-week cycles:
  cycleLengthWeeks: {
    type: Number,
    default: 1,
  },

  weeks: [
    [
      {
        dayOfWeek: { type: Number, min: 0, max: 6 },
        routineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'WorkoutRoutine',
          default: null,
        },
        isRestDay: { type: Boolean, default: false },
      },
    ],
  ],

  currentCycleStartDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
})

module.exports = mongoose.model('WorkoutSchedule', workoutScheduleSchema)
