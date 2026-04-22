import { useState, useEffect } from 'react'
import { useFitTrack, SPORTS_MET, DAILY_ACTIVITIES, calcMETCalories } from '../context/FitTrackContext'
import { useToast } from '../context/ToastContext'
import DashNav from '../components/DashNav'
import Footer from '../components/Footer'
import WorkoutRoutineBuilder from '../components/WorkoutRoutineBuilder'
import WorkoutScheduler from '../components/WorkoutScheduler'
import './Workouts.css'

export default function Workouts() {
  const { profile, today, addSport, setDailyActivities, sportsCalories, activityCalories, setTodayWorkouts } = useFitTrack()
  const { showToast } = useToast()
  const [selectedSport, setSelectedSport] = useState(null)
  const [duration, setDuration] = useState(30)
  const [toast, setToast] = useState('')
  const [showRoutineBuilder, setShowRoutineBuilder] = useState(false)
  const [showScheduler, setShowScheduler] = useState(false)
  const [schedule, setSchedule] = useState(null)
  const [todayRoutine, setTodayRoutine] = useState(null)
  const [activityHours, setActivityHours] = useState(() => {
    // Pre-fill from today's data or defaults
    if (today.activities && today.activities.length > 0) {
      const map = {}
      today.activities.forEach(a => { map[a.name] = a.hours })
      return map
    }
    return { 'Sleeping': 7, 'Sitting (Working/Studying)': 8, 'Slow Walking': 1 }
  })

  const weight = profile?.weight || 70
  const totalActivityHours = Object.values(activityHours).reduce((s, h) => s + (parseFloat(h) || 0), 0)

  // Load schedule and today's routine on mount
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const res = await fetch('/api/workout-schedules', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('fittrack_token')}` }
        })
        const data = await res.json()
        if (data) setSchedule(data)
      } catch (err) {
        console.log('No schedule yet')
      }
    }

    const loadTodayRoutine = async () => {
      try {
        const res = await fetch('/api/workout-schedules/today-routine/get', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('fittrack_token')}` }
        })
        const data = await res.json()
        if (data.routine && !data.isRestDay) {
          setTodayRoutine(data.routine)
        }
      } catch (err) {
        console.log('No routine for today')
      }
    }

    loadSchedule()
    loadTodayRoutine()
  }, [])

  async function handleLoadRoutine() {
    if (!todayRoutine) return;
    const mappedWorkouts = todayRoutine.exercises.map(ex => ({
      name: ex.name,
      sets: ex.sets || '',
      weight: ex.weight ? `${ex.weight}` : 'bodyweight',
      calories: ex.calories || 0,
    }))
    await setTodayWorkouts(mappedWorkouts)
  }

  async function handleLogSport() {
    if (!selectedSport || !duration) return
    const cal = await addSport(selectedSport, parseInt(duration))
    setToast(`${selectedSport.name}: ${cal} cal burned! 🔥`)
    setSelectedSport(null)
    setDuration(30)
    setTimeout(() => setToast(''), 3000)
  }

  function handleUpdateHours(name, hrs) {
    setActivityHours(prev => ({ ...prev, [name]: hrs }))
  }

  function handleSaveActivities() {
    const activities = DAILY_ACTIVITIES.filter(a => activityHours[a.name] && parseFloat(activityHours[a.name]) > 0)
      .map(a => ({ ...a, hours: parseFloat(activityHours[a.name]) }))
    setDailyActivities(activities)
    setToast('Daily activities saved! 📊')
    setTimeout(() => setToast(''), 3000)
  }

  // Calculate preview calories for each activity
  const activityData = DAILY_ACTIVITIES.map(a => {
    const hrs = parseFloat(activityHours[a.name]) || 0
    return { ...a, hours: hrs, calories: calcMETCalories(a.met, weight, hrs * 60) }
  }).filter(a => a.hours > 0)

  const totalDailyBurn = activityData.reduce((s, a) => s + a.calories, 0)

  return (
    <div className="dashboard">
      <DashNav />
      <main className="dash-main">
        <h1 className="page-title animate-slide-up">WORKOUTS & SPORTS</h1>
        <p className="page-sub animate-slide-up delay-1">Log sports, track daily activities, and see exactly how many calories you burn.</p>

        <div className="workouts-layout">
          {/* ===== WEEKLY ROUTINE SCHEDULE ===== */}
          <section className="wo-section animate-slide-up delay-2">
            <div className="wo-section-header">
              <h2>📅 Weekly Routine</h2>
              <div className="routine-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => setShowRoutineBuilder(true)}>
                  + Routine
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowScheduler(true)}>
                  ⚙️ Schedule
                </button>
              </div>
            </div>

            {schedule ? (
              <div>
                {schedule.cycleType === 'weekly' ? (
                  <div className="weekly-grid">
                    {schedule.weekDays?.map((day, idx) => {
                      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                      const isToday = new Date().getDay() === (idx === 6 ? 0 : idx + 1)
                      const routine = day.routineId
                      return (
                        <div key={idx}
                          className={`day-box animate-slide-up ${isToday ? 'today-highlight' : ''} ${day.isRestDay ? 'rest-day' : ''}`}
                          style={{ animationDelay: `${0.2 + (idx * 0.05)}s`, animationFillMode: 'both' }}>
                          <span className="day-label">{dayNames[idx]}</span>
                          <span className="routine-name">{day.isRestDay ? '🌴 REST' : routine?.name || '—'}</span>
                          {routine && <span className="routine-count">{routine.exercises?.length} ex</span>}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="hint-text">Custom {schedule.cycleLengthWeeks}-week cycle</p>
                )}

                {todayRoutine && (
                  <button className="btn btn-primary" style={{ marginTop: '16px', width: '100%' }} onClick={handleLoadRoutine}>
                    📥 Load Today's Routine: {todayRoutine.name}
                  </button>
                )}
              </div>
            ) : (
              <p className="hint-text">No schedule yet. Create a routine and set up your weekly schedule!</p>
            )}
          </section>
          {/* ===== SPORTS CALORIE CALCULATOR ===== */}
          <section className="wo-section animate-slide-up delay-3">
            <div className="wo-section-header">
              <h2>🏆 Sports Calorie Calculator</h2>
              {sportsCalories > 0 && <span className="wo-badge">{sportsCalories} cal burned today</span>}
            </div>

            <div className="sports-grid">
              {SPORTS_MET.map(sport => (
                <button key={sport.name}
                  className={`sport-card ${selectedSport?.name === sport.name ? 'selected' : ''}`}
                  onClick={() => setSelectedSport(sport)}>
                  <span className="sport-icon">{sport.icon}</span>
                  <span className="sport-name">{sport.name}</span>
                  <span className="sport-met">MET {sport.met}</span>
                </button>
              ))}
            </div>

            {selectedSport && (
              <div className="sport-log-panel animate-slide-up">
                <div className="slp-header">
                  <span className="slp-sport">{selectedSport.icon} {selectedSport.name}</span>
                  <span className="slp-met">MET Value: {selectedSport.met}</span>
                </div>
                <div className="slp-body">
                  <div className="slp-field">
                    <label>Duration (minutes)</label>
                    <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
                      min="5" max="300" />
                  </div>
                  <div className="slp-preview">
                    <div className="slp-preview-cal">
                      {calcMETCalories(selectedSport.met, weight, parseInt(duration) || 0)}
                    </div>
                    <div className="slp-preview-label">calories burned</div>
                    <div className="slp-formula">
                      MET ({selectedSport.met}) × {weight}kg × {((parseInt(duration) || 0) / 60).toFixed(2)}h
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={handleLogSport} style={{ width: '100%' }}>
                  Log {selectedSport.name} →
                </button>
              </div>
            )}

            {/* Logged sports today */}
            {today.sports && today.sports.length > 0 && (
              <div className="logged-sports">
                <h4>Today's Sports Log</h4>
                {today.sports.map((s, i) => (
                  <div className="logged-sport-item" key={i}>
                    <span className="ls-icon">{s.icon}</span>
                    <div className="ls-info">
                      <span className="ls-name">{s.name}</span>
                      <span className="ls-meta">{s.duration} min · {s.time}</span>
                    </div>
                    <span className="ls-cal">{s.calories} cal</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ===== DAILY ACTIVITY BREAKDOWN ===== */}
          <section className="wo-section animate-slide-up delay-4">
            <div className="wo-section-header">
              <h2>📊 Daily Activity Calorie Chart</h2>
              <span className="wo-badge-info">{totalActivityHours.toFixed(1)}h / 24h logged</span>
            </div>
            <p className="wo-hint">Enter how many hours you spend on each activity to see your calorie burn breakdown.</p>

            <div className="activity-input-grid">
              {DAILY_ACTIVITIES.map(a => (
                <div className="activity-input-row" key={a.name}>
                  <span className="air-icon" style={{ background: a.color + '22', color: a.color }}>{a.icon}</span>
                  <span className="air-name">{a.name}</span>
                  <div className="air-input-wrap">
                    <input type="number" min="0" max="24" step="0.5"
                      value={activityHours[a.name] || ''}
                      onChange={e => handleUpdateHours(a.name, e.target.value)}
                      placeholder="0" />
                    <span className="air-unit">hrs</span>
                  </div>
                  <span className="air-cal">
                    {calcMETCalories(a.met, weight, (parseFloat(activityHours[a.name]) || 0) * 60)} cal
                  </span>
                </div>
              ))}
            </div>

            {totalActivityHours > 24 && (
              <div className="activity-warning">⚠️ Total hours exceed 24! Please adjust.</div>
            )}

            <button className="btn btn-primary" onClick={handleSaveActivities}
              style={{ width: '100%', marginTop: 16 }}
              disabled={totalActivityHours > 24}>
              Save Daily Activities →
            </button>

            {/* Visual Chart */}
            {activityData.length > 0 && (
              <div className="activity-chart">
                <div className="ac-header">
                  <h4>Calorie Burn Breakdown</h4>
                  <span className="ac-total">{totalDailyBurn} cal total</span>
                </div>

                {/* Bar chart */}
                <div className="ac-bars">
                  {activityData.map(a => {
                    const pct = totalDailyBurn > 0 ? (a.calories / totalDailyBurn) * 100 : 0
                    return (
                      <div className="ac-bar-row" key={a.name}>
                        <div className="ac-bar-label">
                          <span className="ac-bar-icon">{a.icon}</span>
                          <span>{a.name}</span>
                        </div>
                        <div className="ac-bar-track">
                          <div className="ac-bar-fill" style={{ width: `${pct}%`, background: a.color }}></div>
                        </div>
                        <div className="ac-bar-value">
                          <strong>{a.calories}</strong> cal
                          <span className="ac-bar-hrs">{a.hours}h</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Donut chart */}
                <div className="ac-donut-section">
                  <svg viewBox="0 0 100 100" className="ac-donut">
                    {(() => {
                      let offset = 0
                      return activityData.map((a, i) => {
                        const pct = totalDailyBurn > 0 ? (a.calories / totalDailyBurn) * 100 : 0
                        const circ = 2 * Math.PI * 40
                        const dash = (pct / 100) * circ
                        const currentOffset = offset
                        offset += pct
                        return (
                          <circle key={i} cx="50" cy="50" r="40" fill="none"
                            stroke={a.color} strokeWidth="8"
                            strokeDasharray={`${dash} ${circ - dash}`}
                            strokeDashoffset={-(currentOffset / 100) * circ}
                            transform="rotate(-90 50 50)" />
                        )
                      })
                    })()}
                    <text x="50" y="46" textAnchor="middle" fill="white" fontSize="12" fontFamily="Bebas Neue">{totalDailyBurn}</text>
                    <text x="50" y="58" textAnchor="middle" fill="#777" fontSize="5">calories</text>
                  </svg>
                  <div className="ac-donut-legend">
                    {activityData.map(a => (
                      <div className="ac-legend-item" key={a.name}>
                        <span className="ac-legend-dot" style={{ background: a.color }}></span>
                        <span className="ac-legend-name">{a.name}</span>
                        <span className="ac-legend-pct">{Math.round((a.calories / totalDailyBurn) * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

        </div>

        {/* Modals */}
        {showRoutineBuilder && (
          <div className="modal-overlay" onClick={() => setShowRoutineBuilder(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowRoutineBuilder(false)}>×</button>
              <WorkoutRoutineBuilder />
            </div>
          </div>
        )}

        {showScheduler && (
          <div className="modal-overlay" onClick={() => setShowScheduler(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowScheduler(false)}>×</button>
              <WorkoutScheduler />
            </div>
          </div>
        )}
      </main>
      <Footer />
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
