import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFitTrack } from '../context/FitTrackContext'
import DashNav from '../components/DashNav'
import StatCard from '../components/StatCard'
import WeeklyChart from '../components/WeeklyChart'
import WorkoutList from '../components/WorkoutList'
import QuickActions from '../components/QuickActions'
import ActivityFeed from '../components/ActivityFeed'
import Footer from '../components/Footer'
import ProfileModal from '../modals/ProfileModal'
import MealModal from '../modals/MealModal'
import WaterModal from '../modals/WaterModal'
import CalorieBreakdown from '../modals/CalorieBreakdown'
import './Dashboard.css'

export default function Dashboard() {
  const { profile, today, bmr, tdee, caloriesBurned } = useFitTrack()
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!profile) setModal('profile')
  }, [profile])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  // Calculated values
  const caloriesConsumed = today.caloriesConsumed
  const caloriesNet = caloriesConsumed - caloriesBurned
  const caloriesRemaining = Math.max(0, tdee - caloriesNet)
  const calorieProgress = tdee > 0 ? Math.min(100, Math.round((caloriesConsumed / tdee) * 100)) : 0

  const waterMl = today.waterMl
  const waterGoal = 3000
  const waterL = (waterMl / 1000).toFixed(1)
  const waterProgress = Math.min(100, Math.round((waterMl / waterGoal) * 100))

  const totalWorkouts = today.workouts.length
  const doneWorkouts = today.workouts.filter(w => w.done).length
  const workoutProgress = totalWorkouts > 0 ? Math.round((doneWorkouts / totalWorkouts) * 100) : 0

  const overallGoal = Math.round(calorieProgress * 0.4 + workoutProgress * 0.4 + waterProgress * 0.2)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING'
  const displayName = profile ? profile.name.toUpperCase() : 'GUEST'
  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="dashboard">
      <DashNav />

      <main className="dash-main">
        <div className="dash-header-row">
          <div>
            <h1 className="dash-greeting">{greeting}, {displayName}</h1>
            <p className="dash-date">{dateStr}</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/workouts')}>+ New Workout</button>
        </div>

        {/* TDEE Badge */}
        <div className="tdee-bar">
          <span className="tdee-badge">
            {profile ? `TDEE: ${tdee} cal/day · BMR: ${bmr}` : 'Set up your profile to calculate calories'}
          </span>
        </div>

        {/* Stat Cards */}
        <div className="stat-cards">
          <StatCard label="Calories Burned" value={`${caloriesBurned}`}
            change={`${caloriesConsumed} eaten · ${caloriesRemaining} remaining`}
            changeClass={caloriesConsumed > tdee ? 'negative' : 'positive'}
            progress={calorieProgress} ringColor="#ff6b35" icon="fire"
            onClick={() => setModal('calories')} />
          <StatCard label="Workouts This Week" value={`${doneWorkouts} <span class="stat-total">/ ${totalWorkouts}</span>`}
            change={doneWorkouts === totalWorkouts && totalWorkouts > 0 ? 'All done! 🎉' : `${totalWorkouts - doneWorkouts} more to go!`}
            changeClass="positive" progress={workoutProgress} ringColor="#AAFF00" icon="workout"
            onClick={() => navigate('/progress')} />
          <StatCard label="Water Intake" value={`${waterL}L <span class="stat-total">/ 3L</span>`}
            change={waterMl >= waterGoal ? 'Goal reached! 🎉' : `${waterGoal - waterMl}ml remaining`}
            changeClass={waterMl >= waterGoal ? 'positive' : 'neutral'}
            progress={waterProgress} ringColor="#4488ff" icon="water"
            onClick={() => setModal('water')} />
          <StatCard label="Weekly Goals" value={`${overallGoal}%`}
            change={overallGoal >= 80 ? 'Great progress!' : overallGoal >= 50 ? 'On track!' : 'Keep going!'}
            changeClass="positive" progress={overallGoal} ringColor="#AAFF00" icon="goal"
            onClick={() => navigate('/progress')} />
        </div>

        {/* Chart + Workout */}
        <div className="dash-grid-2">
          <WeeklyChart />
          <WorkoutList />
        </div>

        {/* Quick Actions + Activity */}
        <div className="dash-grid-2">
          <QuickActions
            onWorkout={() => navigate('/workouts')}
            onMeal={() => setModal('meal')}
            onWater={() => setModal('water')}
            onStats={() => setModal('calories')}
          />
          <ActivityFeed />
        </div>
      </main>

      <Footer />

      {/* Modals */}
      {modal === 'profile' && <ProfileModal onClose={() => setModal(null)} />}
      {modal === 'meal' && <MealModal onClose={() => { setModal(null); showToast('Meal logged!') }} />}
      {modal === 'water' && <WaterModal onClose={() => { setModal(null); showToast('Water logged! 💧') }} />}
      {modal === 'calories' && <CalorieBreakdown onClose={() => setModal(null)} />}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
