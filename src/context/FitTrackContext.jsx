import { createContext, useContext, useState, useEffect } from 'react'

const FitTrackContext = createContext()

const STORE_KEY = 'fittrack_data'

function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

function getYesterdayKey() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

const DEFAULT_WORKOUTS = [
  { name: 'Bench Press', sets: '4 × 10 reps', weight: '70kg', done: false, calories: 120 },
  { name: 'Overhead Press', sets: '3 × 12 reps', weight: '35kg', done: false, calories: 90 },
  { name: 'Incline Dumbbell Press', sets: '3 × 12 reps', weight: '22kg', done: false, calories: 85 },
  { name: 'Tricep Dips', sets: '3 × 15 reps', weight: 'bodyweight', done: false, calories: 70 },
  { name: 'Lateral Raises', sets: '4 × 15 reps', weight: '10kg', done: false, calories: 55 },
]

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
}

// MET values for sports and daily activities
export const SPORTS_MET = [
  { name: 'Cricket', met: 5.0, icon: '🏏', category: 'sports' },
  { name: 'Football / Soccer', met: 7.0, icon: '⚽', category: 'sports' },
  { name: 'Basketball', met: 6.5, icon: '🏀', category: 'sports' },
  { name: 'Badminton', met: 5.5, icon: '🏸', category: 'sports' },
  { name: 'Tennis', met: 7.3, icon: '🎾', category: 'sports' },
  { name: 'Table Tennis', met: 4.0, icon: '🏓', category: 'sports' },
  { name: 'Volleyball', met: 4.0, icon: '🏐', category: 'sports' },
  { name: 'Swimming', met: 6.0, icon: '🏊', category: 'sports' },
  { name: 'Cycling', met: 7.5, icon: '🚴', category: 'sports' },
  { name: 'Running (8 km/h)', met: 8.3, icon: '🏃', category: 'sports' },
  { name: 'Running (10 km/h)', met: 10.0, icon: '🏃‍♂️', category: 'sports' },
  { name: 'Skipping Rope', met: 11.0, icon: '🪢', category: 'sports' },
  { name: 'Boxing / Martial Arts', met: 7.8, icon: '🥊', category: 'sports' },
  { name: 'Yoga', met: 2.5, icon: '🧘', category: 'sports' },
  { name: 'Dancing', met: 5.0, icon: '💃', category: 'sports' },
  { name: 'Hiking', met: 6.0, icon: '🥾', category: 'sports' },
  { name: 'Kabaddi', met: 7.0, icon: '🤼', category: 'sports' },
  { name: 'Hockey', met: 8.0, icon: '🏑', category: 'sports' },
]

export const DAILY_ACTIVITIES = [
  { name: 'Sleeping', met: 0.95, icon: '😴', color: '#6366f1' },
  { name: 'Resting in Bed', met: 1.0, icon: '🛌', color: '#8b5cf6' },
  { name: 'Sitting (Working/Studying)', met: 1.3, icon: '💺', color: '#f59e0b' },
  { name: 'Standing', met: 1.8, icon: '🧍', color: '#f97316' },
  { name: 'Slow Walking', met: 2.5, icon: '🚶', color: '#22c55e' },
  { name: 'Brisk Walking', met: 3.8, icon: '🚶‍♂️', color: '#10b981' },
  { name: 'Cooking', met: 2.5, icon: '🍳', color: '#ef4444' },
  { name: 'Cleaning / Chores', met: 3.5, icon: '🧹', color: '#ec4899' },
  { name: 'Driving', met: 2.0, icon: '🚗', color: '#3b82f6' },
  { name: 'Light Exercise', met: 3.5, icon: '🤸', color: '#AAFF00' },
]

function calculateBMR(profile) {
  const { weight, height, age, gender } = profile
  return gender === 'male'
    ? Math.round(10 * weight + 6.25 * height - 5 * age + 5)
    : Math.round(10 * weight + 6.25 * height - 5 * age - 161)
}

function calculateTDEE(profile) {
  const bmr = calculateBMR(profile)
  const multiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel] || 1.55
  return Math.round(bmr * multiplier)
}

export function calcMETCalories(met, weightKg, durationMinutes) {
  return Math.round(met * weightKg * (durationMinutes / 60))
}

function makeDayData() {
  return {
    caloriesConsumed: 0,
    meals: [],
    waterMl: 0,
    workouts: DEFAULT_WORKOUTS.map(w => ({ ...w })),
    workoutsCompleted: 0,
    sports: [],
    activities: [],
  }
}

export function FitTrackProvider({ children }) {
  const [data, setData] = useState(() => {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return JSON.parse(raw)
    return { profile: null, days: {} }
  })

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(data))
  }, [data])

  function getDayData(dateKey) {
    return data.days[dateKey] || null
  }

  function getTodayData() {
    const key = getTodayKey()
    if (data.days[key]) return data.days[key]
    return makeDayData()
  }

  function updateTodayData(updater) {
    const key = getTodayKey()
    setData(prev => {
      const today = prev.days[key] || makeDayData()
      const updated = typeof updater === 'function' ? updater(today) : updater
      return { ...prev, days: { ...prev.days, [key]: updated } }
    })
  }

  function updateProfile(profile) {
    setData(prev => ({ ...prev, profile }))
  }

  function toggleWorkout(index) {
    updateTodayData(today => {
      const workouts = today.workouts.map((w, i) =>
        i === index ? { ...w, done: !w.done } : w
      )
      return { ...today, workouts, workoutsCompleted: workouts.filter(w => w.done).length }
    })
  }

  // Update a specific workout's weight
  function updateWorkoutWeight(index, newWeight) {
    updateTodayData(today => {
      const workouts = today.workouts.map((w, i) =>
        i === index ? { ...w, weight: newWeight } : w
      )
      return { ...today, workouts }
    })
  }

  // Add a custom exercise to today's plan
  function addCustomWorkout(exercise) {
    updateTodayData(today => ({
      ...today,
      workouts: [...today.workouts, { ...exercise, done: false }],
    }))
  }

  // Remove a workout from today's plan
  function removeWorkout(index) {
    updateTodayData(today => ({
      ...today,
      workouts: today.workouts.filter((_, i) => i !== index),
    }))
  }

  // Replace entire workout list (for loading a plan)
  function setTodayWorkouts(workouts) {
    updateTodayData(today => ({
      ...today,
      workouts: workouts.map(w => ({ ...w, done: false })),
      workoutsCompleted: 0,
    }))
  }

  function addMeal(name, calories) {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    updateTodayData(today => ({
      ...today,
      meals: [...today.meals, { name, calories, time }],
      caloriesConsumed: today.caloriesConsumed + calories,
    }))
  }

  function addWater(ml) {
    updateTodayData(today => ({
      ...today,
      waterMl: Math.min(today.waterMl + ml, 5000),
    }))
  }

  function addSport(sport, durationMinutes) {
    const weight = data.profile?.weight || 70
    const calories = calcMETCalories(sport.met, weight, durationMinutes)
    updateTodayData(today => ({
      ...today,
      sports: [...(today.sports || []), {
        name: sport.name,
        icon: sport.icon,
        met: sport.met,
        duration: durationMinutes,
        calories,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }],
    }))
    return calories
  }

  function setDailyActivities(activities) {
    const weight = data.profile?.weight || 70
    const withCalories = activities.map(a => ({
      ...a,
      calories: calcMETCalories(a.met, weight, a.hours * 60),
    }))
    updateTodayData(today => ({
      ...today,
      activities: withCalories,
    }))
  }

  const profile = data.profile
  const today = getTodayData()
  const yesterday = getDayData(getYesterdayKey())
  const allDays = data.days
  const bmr = profile ? calculateBMR(profile) : 0
  const tdee = profile ? calculateTDEE(profile) : 0
  const workoutCalories = today.workouts.filter(w => w.done).reduce((s, w) => s + w.calories, 0)
  const sportsCalories = (today.sports || []).reduce((s, sp) => s + sp.calories, 0)
  const activityCalories = (today.activities || []).reduce((s, a) => s + a.calories, 0)
  const caloriesBurned = workoutCalories + sportsCalories + activityCalories

  const value = {
    profile,
    today,
    yesterday,
    allDays,
    bmr,
    tdee,
    caloriesBurned,
    workoutCalories,
    sportsCalories,
    activityCalories,
    updateProfile,
    toggleWorkout,
    updateWorkoutWeight,
    addCustomWorkout,
    removeWorkout,
    setTodayWorkouts,
    addMeal,
    addWater,
    addSport,
    setDailyActivities,
    calculateBMR,
    calculateTDEE,
  }

  return <FitTrackContext.Provider value={value}>{children}</FitTrackContext.Provider>
}

export function useFitTrack() {
  return useContext(FitTrackContext)
}
