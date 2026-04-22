// ============================================
//  COMMUNITY ROUTES — routes/community.js
// ============================================
//
//  ROUTES:
//    GET    /api/community/feed              — Get paginated feed
//    POST   /api/community/posts             — Create a new post
//    POST   /api/community/posts/:id/like    — Toggle like
//    POST   /api/community/posts/:id/comment — Add comment
//    GET    /api/community/challenges        — Get all active challenges
//    POST   /api/community/challenges/:id/join — Join a challenge
//    GET    /api/community/leaderboard       — Get leaderboard
// ============================================

const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const { protect } = require('../middleware/auth')
const asyncHandler = require('../utils/asyncHandler')
const AppError = require('../utils/AppError')
const { validateRequest } = require('../middleware/validators')
const { postSchema, commentSchema } = require('../middleware/schemas')
const CommunityPost = require('../models/CommunityPost')
const Challenge = require('../models/Challenge')
const DayData = require('../models/DayData')
const User = require('../models/User')

// All community routes require authentication
router.use(protect)

// -----------------------------------------------
//  GET /api/community/feed
//  Get paginated community feed (newest first)
// -----------------------------------------------
router.get('/feed', asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, parseInt(req.query.limit) || 20)
  const skip = (page - 1) * limit

  const posts = await CommunityPost.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'username profile')
    .populate('comments.user', 'username profile')
    .lean()

  const total = await CommunityPost.countDocuments()

  // Format posts for the frontend
  const formattedPosts = posts.map(post => ({
    _id: post._id,
    user: {
      _id: post.user._id,
      name: post.user.username,
      avatar: post.user.username.slice(0, 2).toUpperCase(),
    },
    type: post.type,
    content: post.content,
    icon: post.icon,
    likes: post.likes.length,
    isLiked: post.likes.some(id => id.toString() === req.user._id.toString()),
    comments: post.comments.map(c => ({
      _id: c._id,
      user: {
        _id: c.user._id,
        name: c.user.username,
        avatar: c.user.username.slice(0, 2).toUpperCase(),
      },
      text: c.text,
      createdAt: c.createdAt,
    })),
    createdAt: post.createdAt,
  }))

  res.json({
    success: true,
    posts: formattedPosts,
    page,
    totalPages: Math.ceil(total / limit),
    total,
  })
}))

// -----------------------------------------------
//  POST /api/community/posts
//  Create a new community post
// -----------------------------------------------
router.post('/posts', validateRequest(postSchema), asyncHandler(async (req, res) => {
  const { content, type, icon } = req.body

  const post = await CommunityPost.create({
    user: req.user._id,
    content,
    type: type || 'general',
    icon: icon || '💪',
  })

  // Populate user data for the response
  await post.populate('user', 'username profile')

  res.status(201).json({
    success: true,
    post: {
      _id: post._id,
      user: {
        _id: post.user._id,
        name: post.user.username,
        avatar: post.user.username.slice(0, 2).toUpperCase(),
      },
      type: post.type,
      content: post.content,
      icon: post.icon,
      likes: 0,
      isLiked: false,
      comments: [],
      createdAt: post.createdAt,
    },
  })
}))

// -----------------------------------------------
//  POST /api/community/posts/:id/like
//  Toggle like on a post
// -----------------------------------------------
router.post('/posts/:id/like', asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid post ID', 400)
  }

  const post = await CommunityPost.findById(req.params.id)
  if (!post) {
    throw new AppError('Post not found', 404)
  }

  const userId = req.user._id
  const likeIndex = post.likes.findIndex(id => id.toString() === userId.toString())

  if (likeIndex > -1) {
    // Unlike
    post.likes.splice(likeIndex, 1)
  } else {
    // Like
    post.likes.push(userId)
  }

  await post.save()

  res.json({
    success: true,
    likes: post.likes.length,
    isLiked: likeIndex === -1, // Was not liked, now is
  })
}))

// -----------------------------------------------
//  POST /api/community/posts/:id/comment
//  Add a comment to a post
// -----------------------------------------------
router.post('/posts/:id/comment', validateRequest(commentSchema), asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid post ID', 400)
  }

  const post = await CommunityPost.findById(req.params.id)
  if (!post) {
    throw new AppError('Post not found', 404)
  }

  const comment = {
    user: req.user._id,
    text: req.body.text,
    createdAt: new Date(),
  }

  post.comments.push(comment)
  await post.save()

  // Get the added comment with populated user
  const updatedPost = await CommunityPost.findById(post._id)
    .populate('comments.user', 'username profile')
    .lean()

  const addedComment = updatedPost.comments[updatedPost.comments.length - 1]

  res.status(201).json({
    success: true,
    comment: {
      _id: addedComment._id,
      user: {
        _id: addedComment.user._id,
        name: addedComment.user.username,
        avatar: addedComment.user.username.slice(0, 2).toUpperCase(),
      },
      text: addedComment.text,
      createdAt: addedComment.createdAt,
    },
  })
}))

// -----------------------------------------------
//  GET /api/community/challenges
//  Get all active challenges
// -----------------------------------------------
router.get('/challenges', asyncHandler(async (req, res) => {
  const now = new Date()

  const challenges = await Challenge.find({ endsAt: { $gte: now } })
    .sort({ startsAt: 1 })
    .lean({ virtuals: true })

  const formattedChallenges = challenges.map(ch => {
    const isJoined = ch.participants.some(
      p => p.user.toString() === req.user._id.toString()
    )
    const myProgress = isJoined
      ? ch.participants.find(p => p.user.toString() === req.user._id.toString())?.progress || 0
      : 0

    // Calculate progress based on days elapsed
    const elapsed = Math.max(0, Math.floor((now - new Date(ch.startsAt)) / (1000 * 60 * 60 * 24)))
    const autoProgress = isJoined ? Math.min(100, Math.round((elapsed / ch.duration) * 100)) : 0

    return {
      _id: ch._id,
      name: ch.name,
      description: ch.description,
      icon: ch.icon,
      color: ch.color,
      difficulty: ch.difficulty,
      duration: ch.duration,
      daysLeft: ch.daysLeft,
      reward: ch.reward,
      participants: ch.participants.length,
      isJoined,
      progress: isJoined ? Math.max(myProgress, autoProgress) : 0,
    }
  })

  res.json({
    success: true,
    challenges: formattedChallenges,
  })
}))

// -----------------------------------------------
//  POST /api/community/challenges/:id/join
//  Join a challenge
// -----------------------------------------------
router.post('/challenges/:id/join', asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid challenge ID', 400)
  }

  const challenge = await Challenge.findById(req.params.id)
  if (!challenge) {
    throw new AppError('Challenge not found', 404)
  }

  // Check if already a participant
  const alreadyJoined = challenge.participants.some(
    p => p.user.toString() === req.user._id.toString()
  )

  if (alreadyJoined) {
    throw new AppError('You have already joined this challenge', 400)
  }

  challenge.participants.push({
    user: req.user._id,
    joinedAt: new Date(),
    progress: 0,
  })

  await challenge.save()

  res.json({
    success: true,
    message: `Joined "${challenge.name}"!`,
    participants: challenge.participants.length,
  })
}))

// -----------------------------------------------
//  GET /api/community/leaderboard
//  Compute leaderboard from real user fitness data
// -----------------------------------------------
router.get('/leaderboard', asyncHandler(async (req, res) => {
  // Get all users
  const users = await User.find().select('username profile').lean()

  // Get the last 30 days of data for scoring
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const leaderboard = []

  for (const user of users) {
    // Get user's DayData for the last 30 days
    const days = await DayData.find({
      user: user._id,
      date: { $gte: thirtyDaysAgo },
    }).lean()

    // Calculate score
    let totalWorkouts = 0
    let totalCaloriesBurned = 0
    let streak = 0
    let currentStreak = 0

    // Sort days by date
    const sortedDays = days.sort((a, b) => new Date(a.date) - new Date(b.date))

    for (const day of sortedDays) {
      const completedWorkouts = (day.workouts || []).filter(w => w.done).length
      totalWorkouts += completedWorkouts
      const workoutCal = (day.workouts || []).filter(w => w.done).reduce((s, w) => s + (w.calories || 0), 0)
      const sportsCal = (day.sports || []).reduce((s, sp) => s + (sp.calories || 0), 0)
      totalCaloriesBurned += workoutCal + sportsCal

      if (completedWorkouts > 0) {
        currentStreak++
        streak = Math.max(streak, currentStreak)
      } else {
        currentStreak = 0
      }
    }

    // Score formula: workouts * 100 + calories / 10 + streak * 50
    const score = Math.round(totalWorkouts * 100 + totalCaloriesBurned / 10 + streak * 50)

    leaderboard.push({
      _id: user._id,
      name: user.username,
      avatar: user.username.slice(0, 2).toUpperCase(),
      score,
      workouts: totalWorkouts,
      streak,
      isYou: user._id.toString() === req.user._id.toString(),
    })
  }

  // Sort by score descending
  leaderboard.sort((a, b) => b.score - a.score)

  // Add ranks
  leaderboard.forEach((entry, i) => {
    entry.rank = i + 1
  })

  res.json({
    success: true,
    leaderboard: leaderboard.slice(0, 50), // Top 50
  })
}))

module.exports = router
