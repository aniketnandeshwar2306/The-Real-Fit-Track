import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useToast } from './ToastContext'

const FitTrackContext = createContext()

const STORE_KEY = 'fittrack_data'

// -----------------------------------------------
//  Date helpers — LOCAL timezone (not UTC!)
// -----------------------------------------------
//
//  WHY NOT toISOString().slice(0, 10)?
//  toISOString() returns UTC time. In India (UTC+5:30),
//  between 12:00 AM and 5:30 AM IST, the UTC date is
//  the PREVIOUS day. This caused data to be stored under
//  the wrong date when logging late at night.
//
//  Using getFullYear()/getMonth()/getDate() gives us
//  the LOCAL date — the date the user sees on their clock.
//
function getTodayKey() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getYesterdayKey() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
  const [data, setData] = useState({ profile: null, days: {} })
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  const { showToast } = useToast()

  // Fetch initial profile and daily data
  useEffect(() => {
    async function loadInitialData() {
      const token = localStorage.getItem('fittrack_token')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        // 1. Fetch User Profile
        const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const profileData = await profileRes.json()

        if (!profileData.success) {
          throw new Error(profileData.message)
        }

        // 2. Fetch ALL of today's data in one request
        const todayRes = await fetch(`${import.meta.env.VITE_API_URL}/today`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const todayData = await todayRes.json()

        if (!todayData.success) {
          throw new Error(todayData.message)
        }
        
        const dateKey = getTodayKey()

        setData({
          profile: { ...profileData.user.profile, name: profileData.user.username },
          days: {
            [dateKey]: {
              caloriesConsumed: todayData.caloriesConsumed || 0,
              meals: todayData.meals || [],
              waterMl: todayData.waterMl || 0,
              workouts: todayData.workouts || [],
              workoutsCompleted: todayData.workoutsCompleted || 0,
              sports: todayData.sports || [],
              activities: todayData.activities || [],
            }
          }
        })
      } catch (err) {
        console.error('Failed to load initial data:', err)
        setAuthError(err.message)
        // If token is invalid, clear it
        if (err.message.includes('token') || err.message.includes('auth')) {
          localStorage.removeItem('fittrack_token')
        }
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

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

  async function updateProfile(profile) {
    const token = localStorage.getItem('fittrack_token')
    if (!token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      })
      const data = await response.json()
      if (data.success) {
        setData(prev => ({ ...prev, profile: data.profile }))
        showToast('Profile updated successfully', 'success')
      } else {
        showToast(data.message || 'Failed to update profile', 'error')
      }
    } catch (err) {
      console.error('Update profile error:', err)
      showToast('Could not update profile', 'error')
    }
  }

  async function toggleWorkout(index) {
    const token = localStorage.getItem('fittrack_token')
    if (!token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workouts/${index}/toggle`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const resData = await response.json()
      if (resData.success) {
        updateTodayData({
          ...getTodayData(),
          workouts: resData.workouts,
          workoutsCompleted: resData.workoutsCompleted
        })
        showToast('Workout toggled', 'success')
      } else {
        showToast(resData.message || 'Failed to toggle workout', 'error')
      }
    } catch (err) {
      console.error('Toggle workout error:', err)
      showToast('Could not toggle workout', 'error')
    }
  }

  // Update a specific workout's weight
  async function updateWorkoutWeight(index, newWeight) {
    const token = localStorage.getItem('fittrack_token')
    if (!token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workouts/${index}/weight`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ weight: newWeight })
      })
      const resData = await response.json()
      if (resData.success) {
        updateTodayData(today => {
          const workouts = today.workouts.map((w, i) =>
            i === index ? { ...w, weight: newWeight } : w
          )
          return { ...today, workouts }
        })
        showToast('Weight updated', 'success')
      } else {
        showToast(resData.message || 'Failed to update weight', 'error')
      }
    } catch (err) {
      console.error('Update weight error:', err)
      showToast('Could not update weight', 'error')
    }
  }

  // Add a custom exercise to today's plan
  async function addCustomWorkout(exercise) {
    const token = localStorage.getItem('fittrack_token')
    if (!token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(exercise)
      })
      const resData = await response.json()
      if (resData.success) {
        updateTodayData(today => ({
          ...today,
          workouts: resData.workouts
        }))
        showToast('Workout added', 'success')
      } else {
        showToast(resData.message || 'Failed to add workout', 'error')
      }
    } catch (err) {
      console.error('Add workout error:', err)
      showToast('Could not add workout', 'error')
    }
  }

  // Remove a workout from today's plan
  async function removeWorkout(index) {
    const token = localStorage.getItem('fittrack_token')
    if (!token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workouts/${index}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const resData = await response.json()
      if (resData.success) {
        updateTodayData(today => ({
          ...today,
          workouts: resData.workouts,
          workoutsCompleted: resData.workoutsCompleted
        }))
        showToast('Workout removed', 'success')
      } else {
        showToast(resData.message || 'Failed to remove workout', 'error')
      }
    } catch (err) {
      console.error('Remove workout error:', err)
      showToast('Could not remove workout', 'error')
    }
  }

  // Replace entire workout list (for loading a plan)
  async function setTodayWorkouts(workouts) {
    const token = localStorage.getItem('fittrack_token')
    if (!token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workouts/plan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workouts })
      })
      const resData = await response.json()
      if (resData.success) {
        updateTodayData(today => ({
          ...today,
          workouts: resData.workouts,
          workoutsCompleted: 0,
        }))
        showToast('Workout plan loaded', 'success')
      } else {
        showToast(resData.message || 'Failed to load workout plan', 'error')
      }
    } catch (err) {
      console.error('Set plan error:', err)
      showToast('Could not load workout plan', 'error')
    }
  }

  async function addMeal(name, calories) {
    const token = localStorage.getItem('fittrack_token')
    if (!token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/meals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, calories })
      })
      const resData = await response.json()
      if (resData.success) {
        updateTodayData(today => ({
          ...today,
          meals: resData.meals,
          caloriesConsumed: resData.caloriesConsumed,
        }))
        showToast('Meal added', 'success')
      } else {
        showToast(resData.message || 'Failed to add meal', 'error')
      }
    } catch (err) {
      console.error('Add meal error:', err)
      showToast('Could not add meal', 'error')
    }
  }

  async function addWater(ml) {
    const token = localStorage.getItem('fittrack_token')
    if (!token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/water`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ml })
      })
      const resData = await response.json()
      if (resData.success) {
        updateTodayData(today => ({
          ...today,
          waterMl: resData.waterMl,
        }))
        showToast('Water added', 'success')
      } else {
        showToast(resData.message || 'Failed to add water', 'error')
      }
    } catch (err) {
      console.error('Add water error:', err)
      showToast('Could not add water', 'error')
    }
  }

  async function addSport(sport, durationMinutes) {
    const token = localStorage.getItem('fittrack_token')
    if (!token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: sport.name,
          icon: sport.icon,
          met: sport.met,
          duration: durationMinutes
        })
      })
      const resData = await response.json()
      if (resData.success) {
        updateTodayData(today => ({
          ...today,
          sports: resData.totalSports
        }))
        showToast(`${sport.name} added (${resData.sport.calories} cal)`, 'success')
        return resData.sport.calories
      } else {
        showToast(resData.message || 'Failed to add sport', 'error')
      }
    } catch (err) {
      console.error('Add sport error:', err)
      showToast('Could not add sport', 'error')
    }
    return 0
  }

  async function fetchProgressHistory(limit = 30) {
    const token = localStorage.getItem('fittrack_token')
    if (!token) return {}

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/progress?limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const resData = await response.json()
      if (resData.success) {
        return resData.days || {}
      }
    } catch (err) {
      console.error('Fetch progress error:', err)
    }
    return {}
  }

  async function setDailyActivities(activities) {
    const token = localStorage.getItem('fittrack_token')
    if (!token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/activities`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ activities })
      })
      const resData = await response.json()
      if (resData.success) {
        updateTodayData(today => ({
          ...today,
          activities: resData.activities
        }))
        showToast('Activities updated', 'success')
      } else {
        showToast(resData.message || 'Failed to update activities', 'error')
      }
    } catch (err) {
      console.error('Set activities error:', err)
      showToast('Could not update activities', 'error')
    }
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

  // Logout: clear token and reset state (no full page reload!)
  //
  // WHY NOT window.location.href?
  // Using window.location.href = '/' causes a FULL page reload,
  // which destroys all React state and re-downloads everything.
  // Instead, we clear the token and reset state. The ProtectedRoute
  // in App.jsx will automatically redirect to /login.
  //
  const logout = useCallback(() => {
    localStorage.removeItem('fittrack_token')
    setData({ profile: null, days: {} })
    // Navigate is handled by the component that calls logout
  }, [])

  // -----------------------------------------------
  //  Memoize the context value
  // -----------------------------------------------
  //
  //  WHY useMemo?
  //  Without useMemo, the value object is recreated on EVERY render,
  //  even if no data changed. Since objects are compared by reference
  //  in React, every consumer of this context would re-render
  //  every time — even if they only use 'profile' and it didn't change.
  //
  //  useMemo ensures the value object only changes when the actual
  //  data it depends on changes.
  //
  const value = useMemo(() => ({
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
    loading,
    authError,
    logout,
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
    fetchProgressHistory,
    calculateBMR,
    calculateTDEE,
  }), [
    profile, today, yesterday, allDays, bmr, tdee,
    caloriesBurned, workoutCalories, sportsCalories, activityCalories,
    loading, authError, logout,
  ])

  return <FitTrackContext.Provider value={value}>{children}</FitTrackContext.Provider>
}

export function useFitTrack() {
  return useContext(FitTrackContext)
}
