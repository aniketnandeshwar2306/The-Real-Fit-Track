// ============================================
//  COMMUNITY POST MODEL — models/CommunityPost.js
// ============================================
//
//  Stores user-created posts in the community feed.
//  Supports likes (array of user IDs) and threaded comments.
//

const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const communityPostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['workout', 'achievement', 'milestone', 'general'],
    default: 'general',
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  icon: {
    type: String,
    default: '💪',
    maxlength: 10,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [commentSchema],
}, {
  timestamps: true,
})

// Index for efficient feed queries (newest first)
communityPostSchema.index({ createdAt: -1 })

module.exports = mongoose.model('CommunityPost', communityPostSchema)
