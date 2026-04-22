// ============================================
//  CHALLENGE MODEL — models/Challenge.js
// ============================================
//
//  Stores community challenges that users can join.
//  Participants are tracked with their join date and progress.
//

const mongoose = require('mongoose')

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
}, { _id: false })

const challengeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    maxlength: 500,
  },
  icon: {
    type: String,
    default: '🏆',
    maxlength: 10,
  },
  color: {
    type: String,
    default: '#AAFF00',
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  duration: {
    type: Number,  // in days
    required: true,
  },
  reward: {
    type: String,
    default: '🏅 Badge',
    maxlength: 100,
  },
  participants: [participantSchema],
  startsAt: {
    type: Date,
    required: true,
  },
  endsAt: {
    type: Date,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
})

// Virtual: days left
challengeSchema.virtual('daysLeft').get(function () {
  const now = new Date()
  const diff = this.endsAt - now
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

// Include virtuals in JSON output
challengeSchema.set('toJSON', { virtuals: true })
challengeSchema.set('toObject', { virtuals: true })

module.exports = mongoose.model('Challenge', challengeSchema)
