import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
  FC,
} from 'react'
import { useToast } from './ToastContext'

interface Profile {
  name: string
  age: number
  gender: 'male' | 'female'
  weight: number
  height: number
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'
}

interface Workout {
  name: string
  sets: number
  reps: number
  weight: number
  calories: number
  done: boolean
}

interface Meal {
  id: string
  name: string
  calories: number
  timestamp: string
}

interface Sport {
  name: string
  icon: string
  met: number
  duration: number
  calories: number
}

interface Activity {
  name: string
  icon: string
  met: number
  color: string
  calories: number
}

export interface DayData {
  caloriesConsumed: number
  meals: Meal[]
  waterMl: number
  workouts: Workout[]
  workoutsCompleted: number
  sports: Sport[]
  activities: Activity[]
}

interface FitTrackContextType {
  profile: Profile | null
  today: DayData
  yesterday: DayData | null
  allDays: Record<string, DayData>
  bmr: number
  tdee: number
  caloriesBurned: number
  workoutCalories: number
  sportsCalories: number
  activityCalories: number
  loading: boolean
  authError: string | null
  logout: () => void
  updateProfile: (profile: Profile) => Promise<void>
  toggleWorkout: (index: number) => Promise<void>
  updateWorkoutWeight: (index: number, newWeight: number) => Promise<void>
  addCustomWorkout: (exercise: Workout) => Promise<void>
  removeWorkout: (index: number) => Promise<void>
  setTodayWorkouts: (workouts: Workout[]) => Promise<void>
  addMeal: (name: string, calories: number) => Promise<void>
  addWater: (ml: number) => Promise<void>
  addSport: (
    sport: { name: string; icon: string; met: number },
    durationMinutes: number
  ) => Promise<number>
  setDailyActivities: (activities: Activity[]) => Promise<void>
  fetchProgressHistory: (limit?: number) => Promise<Record<string, DayData>>
  calculateBMR: (profile: Profile) => number
  calculateTDEE: (profile: Profile) => number
}

const FitTrackContext = createContext<FitTrackContextType | undefined>(undefined)

// Date helpers — LOCAL timezone (not UTC!)
function getTodayKey(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getYesterdayKey(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface ActivityMultipliers {
  sedentary: number
  light: number
  moderate: number
  active: number
  veryActive: number
}

const ACTIVITY_MULTIPLIERS: ActivityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
}

// MET values for sports and daily activities
export const SPORTS_MET: Sport[] = [
  { name: 'Cricket', met: 5.0, icon: '🏏', duration: 0, calories: 0 },
  {
    name: 'Football / Soccer',
    met: 7.0,
    icon: '⚽',
    duration: 0,
    calories: 0,
  },
  { name: 'Basketball', met: 6.5, icon: '🏀', duration: 0, calories: 0 },
  { name: 'Badminton', met: 5.5, icon: '🏸', duration: 0, calories: 0 },
  { name: 'Tennis', met: 7.3, icon: '🎾', duration: 0, calories: 0 },
  { name: 'Table Tennis', met: 4.0, icon: '🏓', duration: 0, calories: 0 },
  { name: 'Volleyball', met: 4.0, icon: '🏐', duration: 0, calories: 0 },
  { name: 'Swimming', met: 6.0, icon: '🏊', duration: 0, calories: 0 },
  { name: 'Cycling', met: 7.5, icon: '🚴', duration: 0, calories: 0 },
  {
    name: 'Running (8 km/h)',
    met: 8.3,
    icon: '🏃',
    duration: 0,
    calories: 0,
  },
  {
    name: 'Running (10 km/h)',
    met: 10.0,
    icon: '🏃‍♂️',
    duration: 0,
    calories: 0,
  },
  {
    name: 'Skipping Rope',
    met: 11.0,
    icon: '🪢',
    duration: 0,
    calories: 0,
  },
  {
    name: 'Boxing / Martial Arts',
    met: 7.8,
    icon: '🥊',
    duration: 0,
    calories: 0,
  },
  { name: 'Yoga', met: 2.5, icon: '🧘', duration: 0, calories: 0 },
  { name: 'Dancing', met: 5.0, icon: '💃', duration: 0, calories: 0 },
  { name: 'Hiking', met: 6.0, icon: '🥾', duration: 0, calories: 0 },
  { name: 'Kabaddi', met: 7.0, icon: '🤼', duration: 0, calories: 0 },
  { name: 'Hockey', met: 8.0, icon: '🏑', duration: 0, calories: 0 },
]

export const DAILY_ACTIVITIES: Activity[] = [
  { name: 'Sleeping', icon: '😴', met: 0.95, color: '#6366f1', calories: 0 },
  {
    name: 'Resting in Bed',
    icon: '🛌',
    met: 1.0,
    color: '#8b5cf6',
    calories: 0,
  },
  {
    name: 'Sitting (Working/Studying)',
    icon: '💺',
    met: 1.3,
    color: '#f59e0b',
    calories: 0,
  },
  { name: 'Standing', icon: '🧍', met: 1.8, color: '#f97316', calories: 0 },
  {
    name: 'Slow Walking',
    icon: '🚶',
    met: 2.5,
    color: '#22c55e',
    calories: 0,
  },
  {
    name: 'Brisk Walking',
    icon: '🚶‍♂️',
    met: 3.8,
    color: '#10b981',
    calories: 0,
  },
  { name: 'Cooking', icon: '🍳', met: 2.5, color: '#ef4444', calories: 0 },
  {
    name: 'Cleaning / Chores',
    icon: '🧹',
    met: 3.5,
    color: '#ec4899',
    calories: 0,
  },
  { name: 'Driving', icon: '🚗', met: 2.0, color: '#3b82f6', calories: 0 },
  {
    name: 'Light Exercise',
    icon: '🤸',
    met: 3.5,
    color: '#AAFF00',
    calories: 0,
  },
]

function calculateBMR(profile: Profile): number {
  const { weight, height, age, gender } = profile
  return gender === 'male'
    ? Math.round(10 * weight + 6.25 * height - 5 * age + 5)
    : Math.round(10 * weight + 6.25 * height - 5 * age - 161)
}

function calculateTDEE(profile: Profile): number {
  const bmr = calculateBMR(profile)
  const multiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel] || 1.55
  return Math.round(bmr * multiplier)
}

export function calcMETCalories(met: number, weightKg: number, durationMinutes: number): number {
  return Math.round((met * weightKg * durationMinutes) / 60)
}

function makeDayData(): DayData {
  return {
    caloriesConsumed: 0,
    meals: [],
    waterMl: 0,
    workouts: [],
    workoutsCompleted: 0,
    sports: [],
    activities: [],
  }
}

interface FitTrackProviderProps {
  children: ReactNode
}

export const FitTrackProvider: FC<FitTrackProviderProps> = ({ children }) => {
  const [data, setData] = useState({
    profile: null as Profile | null,
    days: {} as Record<string, DayData>,
  })
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
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
          headers: { Authorization: `Bearer ${token}` },
        })
        const profileData = await profileRes.json()

        if (!profileData.success) {
          throw new Error(profileData.message)
        }

        // 2. Fetch ALL of today's data in one request
        const todayRes = await fetch(`${import.meta.env.VITE_API_URL}/today`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const todayData = await todayRes.json()

        if (!todayData.success) {
          throw new Error(todayData.message)
        }

        const dateKey = getTodayKey()

        setData({
          profile: {
            ...profileData.user.profile,
            name: profileData.user.username,
          },
          days: {
            [dateKey]: {
              caloriesConsumed: todayData.caloriesConsumed || 0,
              meals: todayData.meals || [],
              waterMl: todayData.waterMl || 0,
              workouts: todayData.workouts || [],
              workoutsCompleted: todayData.workoutsCompleted || 0,
              sports: todayData.sports || [],
              activities: todayData.activities || [],
            },
          },
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        console.error('Failed to load initial data:', err)
        setAuthError(errorMessage)
        // If token is invalid, clear it
        if (errorMessage.includes('token') || errorMessage.includes('auth')) {
          localStorage.removeItem('fittrack_token')
        }
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  function getDayData(dateKey: string): DayData | null {
    return data.days[dateKey] || null
  }

  function getTodayData(): DayData {
    const key = getTodayKey()
    if (data.days[key]) return data.days[key]
    return makeDayData()
  }

  function updateTodayData(updater: DayData | ((prev: DayData) => DayData)): void {
    const key = getTodayKey()
    setData((prev) => {
      const today = prev.days[key] || makeDayData()
      const updated = typeof updater === 'function' ? updater(today) : updater
      return { ...prev, days: { ...prev.days, [key]: updated } }
    })
  }

  async function updateProfile(profile: Profile): Promise<void> {
    const token = localStorage.getItem('fittrack_token')
    if (!token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      })
      const resData = await response.json()
      if (resData.success) {
        setData((prev) => ({ ...prev, profile: resData.profile }))
        showToast('Profile updated successfully', 'success')
      } else {
        showToast(resData.message || 'Failed to update profile', 'error')
      }
    } catch (err) {
      console.error('Update profile error:', err)
      showToast('Could not update profile', 'error')
    }
  }

  async function toggleWorkout(index: number): Promise<void> {
    const token = localStorage.getItem('fittrack_token')
    if (!token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workouts/${index}/toggle`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      const resData = await response.json()
      if (resData.success) {
        updateTodayData({
          ...getTodayData(),
          workouts: resData.workouts,
          workoutsCompleted: resData.workoutsCompleted,
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
  async function updateWorkoutWeight(index: number, newWeight: number): Promise<void> {
    const token = localStorage.getItem('fittrack_token')
    if (!token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workouts/${index}/weight`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ weight: newWeight }),
      })
      const resData = await response.json()
      if (resData.success) {
        updateTodayData((today) => {
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
  async function addCustomWorkout(exercise: Workout): Promise<void> {
    const token = localStorage.getItem('fittrack_token')
    if (!token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(exercise),
      })
      const resData = await response.json()
      if (resData.success) {
        updateTodayData((today) => ({
          ...today,
          workouts: resData.workouts,
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
  async function removeWorkout(index: number): Promise<void> {
    const token = localStorage.getItem('fittrack_token')
    if (!token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workouts/${index}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const resData = await response.json()
      if (resData.success) {
        updateTodayData((today) => ({
          ...today,
          workouts: resData.workouts,
          workoutsCompleted: resData.workoutsCompleted,
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
  async function setTodayWorkouts(workouts: Workout[]): Promise<void> {
    const token = localStorage.getItem('fittrack_token')
    if (!token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workouts/plan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workouts }),
      })
      const resData = await response.json()
      if (resData.success) {
        updateTodayData((today) => ({
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

  async function addMeal(name: string, calories: number): Promise<void> {
    const token = localStorage.getItem('fittrack_token')
    if (!token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/meals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, calories }),
      })
      const resData = await response.json()
      if (resData.success) {
        updateTodayData((today) => ({
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

  async function addWater(ml: number): Promise<void> {
    const token = localStorage.getItem('fittrack_token')
    if (!token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/water`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ml }),
      })
      const resData = await response.json()
      if (resData.success) {
        updateTodayData((today) => ({
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

  async function addSport(
    sport: { name: string; icon: string; met: number },
    durationMinutes: number
  ): Promise<number> {
    const token = localStorage.getItem('fittrack_token')
    if (!token) return 0

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: sport.name,
          icon: sport.icon,
          met: sport.met,
          duration: durationMinutes,
        }),
      })
      const resData = await response.json()
      if (resData.success) {
        updateTodayData((today) => ({
          ...today,
          sports: resData.totalSports,
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

  async function fetchProgressHistory(limit: number = 30): Promise<Record<string, DayData>> {
    const token = localStorage.getItem('fittrack_token')
    if (!token) return {}

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/progress?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
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

  async function setDailyActivities(activities: Activity[]): Promise<void> {
    const token = localStorage.getItem('fittrack_token')
    if (!token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/activities`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ activities }),
      })
      const resData = await response.json()
      if (resData.success) {
        updateTodayData((today) => ({
          ...today,
          activities: resData.activities,
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
  const workoutCalories = today.workouts.filter((w) => w.done).reduce((s, w) => s + w.calories, 0)
  const sportsCalories = (today.sports || []).reduce((s, sp) => s + sp.calories, 0)
  const activityCalories = (today.activities || []).reduce((s, a) => s + a.calories, 0)
  const caloriesBurned = workoutCalories + sportsCalories + activityCalories

  const logout = useCallback(() => {
    localStorage.removeItem('fittrack_token')
    setData({ profile: null, days: {} })
  }, [])

  const updateProfileCallback = useCallback(updateProfile, [showToast])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const toggleWorkoutCallback = useCallback(toggleWorkout, [showToast])

  const updateWorkoutWeightCallback = useCallback(updateWorkoutWeight, [showToast])

  const addCustomWorkoutCallback = useCallback(addCustomWorkout, [showToast])

  const removeWorkoutCallback = useCallback(removeWorkout, [showToast])

  const setTodayWorkoutsCallback = useCallback(setTodayWorkouts, [showToast])

  const addMealCallback = useCallback(addMeal, [showToast])

  const addWaterCallback = useCallback(addWater, [showToast])

  const addSportCallback = useCallback(addSport, [showToast])

  const setDailyActivitiesCallback = useCallback(setDailyActivities, [showToast])

  const fetchProgressHistoryCallback = useCallback(fetchProgressHistory, [])

  const value: FitTrackContextType = useMemo(
    () => ({
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
      updateProfile: updateProfileCallback,
      toggleWorkout: toggleWorkoutCallback,
      updateWorkoutWeight: updateWorkoutWeightCallback,
      addCustomWorkout: addCustomWorkoutCallback,
      removeWorkout: removeWorkoutCallback,
      setTodayWorkouts: setTodayWorkoutsCallback,
      addMeal: addMealCallback,
      addWater: addWaterCallback,
      addSport: addSportCallback,
      setDailyActivities: setDailyActivitiesCallback,
      fetchProgressHistory: fetchProgressHistoryCallback,
      calculateBMR,
      calculateTDEE,
    }),
    [
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
      updateProfileCallback,
      toggleWorkoutCallback,
      updateWorkoutWeightCallback,
      addCustomWorkoutCallback,
      removeWorkoutCallback,
      setTodayWorkoutsCallback,
      addMealCallback,
      addWaterCallback,
      addSportCallback,
      setDailyActivitiesCallback,
      fetchProgressHistoryCallback,
    ]
  )

  return <FitTrackContext.Provider value={value}>{children}</FitTrackContext.Provider>
}

export function useFitTrack(): FitTrackContextType {
  const context = useContext(FitTrackContext)
  if (!context) {
    throw new Error('useFitTrack must be used within FitTrackProvider')
  }
  return context
}
