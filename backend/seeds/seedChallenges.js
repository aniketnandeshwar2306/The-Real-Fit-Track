// ============================================
//  SEED CHALLENGES — seeds/seedChallenges.js
// ============================================
//
//  Run this once to populate the database with
//  initial challenges: node seeds/seedChallenges.js
//

require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('../config/db')
const Challenge = require('../models/Challenge')

const CHALLENGES_DATA = [
  {
    name: '10K Steps Challenge',
    icon: '👣',
    description: 'Walk 10,000 steps every day for a week',
    difficulty: 'Easy',
    duration: 7,
    reward: '🏅 Step Master Badge',
    color: '#22c55e',
  },
  {
    name: 'Hydration Hero',
    icon: '💧',
    description: 'Drink 3L water daily for 5 days straight',
    difficulty: 'Easy',
    duration: 5,
    reward: '🏅 Hydration Badge',
    color: '#3b82f6',
  },
  {
    name: 'Push-Up Warrior',
    icon: '💪',
    description: 'Do 100 push-ups daily for a month',
    difficulty: 'Hard',
    duration: 30,
    reward: '🏅 Warrior Badge',
    color: '#ef4444',
  },
  {
    name: 'Clean Eating Week',
    icon: '🥗',
    description: 'Stay under your calorie target every day',
    difficulty: 'Medium',
    duration: 7,
    reward: '🏅 Nutrition Badge',
    color: '#f59e0b',
  },
  {
    name: 'Morning Runner',
    icon: '🌅',
    description: 'Run 3km before 7 AM for 2 weeks',
    difficulty: 'Hard',
    duration: 14,
    reward: '🏅 Early Bird Badge',
    color: '#8b5cf6',
  },
  {
    name: 'Yoga Flow',
    icon: '🧘',
    description: '15 min yoga session daily for 21 days',
    difficulty: 'Medium',
    duration: 21,
    reward: '🏅 Zen Badge',
    color: '#ec4899',
  },
]

async function seedChallenges() {
  try {
    await connectDB()
    console.log('Connected to MongoDB')

    // Clear existing challenges
    await Challenge.deleteMany({})
    console.log('Cleared existing challenges')

    const now = new Date()
    const challenges = CHALLENGES_DATA.map(ch => ({
      ...ch,
      startsAt: new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)), // Started 3 days ago
      endsAt: new Date(now.getTime() + (ch.duration * 24 * 60 * 60 * 1000)), // Ends duration days from now
    }))

    await Challenge.insertMany(challenges)
    console.log(`✅ Seeded ${challenges.length} challenges`)

    process.exit(0)
  } catch (err) {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  }
}

seedChallenges()
