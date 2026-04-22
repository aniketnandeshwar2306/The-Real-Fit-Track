import { useState, useEffect } from 'react'
import { useFitTrack, SPORTS_MET, DAILY_ACTIVITIES, calcMETCalories } from '../context/FitTrackContext'
import { useToast } from '../context/ToastContext'
import DashNav from '../components/DashNav'
import Footer from '../components/Footer'
import WorkoutScheduler from '../components/WorkoutScheduler'
import './Workouts.css'

export default function Workouts() {
  const { profile, today, addSport, removeSport, setDailyActivities, sportsCalories, activityCalories, setTodayWorkouts } = useFitTrack()
  const { showToast } = useToast()
  const [selectedSport, setSelectedSport] = useState(null)
  const [duration, setDuration] = useState(30)
  const [toast, setToast] = useState('')
  const [showScheduler, setShowScheduler] = useState(false)
  const [schedule, setSchedule] = useState(null)
  const [todayRoutine, setTodayRoutine] = useState(null)
  const [isRollingCycle, setIsRollingCycle] = useState(false)
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
      setIsRollingCycle(data.isRolling || false)
      if (data.routine && !data.isRestDay) {
        setTodayRoutine(data.routine)
      } else {
        setTodayRoutine(null)
      }
    } catch (err) {
      console.log('No routine for today')
      setTodayRoutine(null)
    }
  }

  useEffect(() => {
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

  async function handleAdvanceRollingDay() {
    try {
      const res = await fetch('/api/workout-schedules/advance-rolling-day', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('fittrack_token')}` }
      })
      if (!res.ok) throw new Error('Failed to advance day')
      await loadSchedule()
      await loadTodayRoutine()
      showToast('Cycle advanced successfully! 🔄', 'success')
    } catch(err) {
      showToast(err.message, 'error')
    }
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

  const activityData = DAILY_ACTIVITIES.map(a => {
    const hrs = parseFloat(activityHours[a.name]) || 0
    return { ...a, hours: hrs, calories: calcMETCalories(a.met, weight, hrs * 60) }
  }).filter(a => a.hours > 0)

  const totalDailyBurn = activityData.reduce((s, a) => s + a.calories, 0)

  function closeModalsAndRefresh() {
    setShowScheduler(false)
    loadSchedule()
    loadTodayRoutine()
  }

  return (
    <div className="dashboard">
      <DashNav />
      <main className="dash-main">
        <h1 className="page-title animate-slide-up">WORKOUTS & SPORTS</h1>
        <p className="page-sub animate-slide-up delay-1">Log sports, track daily activities, and manage your workout schedule.</p>

        <div className="workouts-layout">
          {/* ===== WEEKLY ROUTINE SCHEDULE ===== */}
          <section className="wo-section animate-slide-up delay-2">
            <div className="wo-section-header">
              <h2>📅 Unified Plan</h2>
              <div className="routine-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => setShowScheduler(true)}>
                  ⚙️ Configure Planner
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
                      return (
                        <div key={idx}
                          className={`day-box animate-slide-up ${isToday ? 'today-highlight' : ''} ${day.isRestDay ? 'rest-day' : ''}`}
                          style={{ animationDelay: `${0.2 + (idx * 0.05)}s`, animationFillMode: 'both' }}>
                          <span className="day-label">{dayNames[idx]}</span>
                          <span className="routine-name">{day.isRestDay ? '🌴 REST' : (day.name || 'Workout')}</span>
                          {!day.isRestDay && <span className="routine-count">{(day.exercises || []).length} ex</span>}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="weekly-grid">
                    {schedule.rollingDays?.map((day, idx) => {
                      const isActiveDay = schedule.currentRollingDay === idx
                      return (
                        <div key={idx}
                          className={`day-box animate-slide-up ${isActiveDay ? 'today-highlight' : ''} ${day.isRestDay ? 'rest-day' : ''}`}
                          style={{ animationDelay: `${0.2 + (idx * 0.05)}s`, animationFillMode: 'both' }}>
                          <span className="day-label">Day {idx + 1}</span>
                          <span className="routine-name">{day.isRestDay ? '🌴 REST' : (day.name || 'Workout')}</span>
                          {!day.isRestDay && <span className="routine-count">{(day.exercises || []).length} ex</span>}
                        </div>
                      )
                    })}
                  </div>
                )}

                {todayRoutine ? (
                  <button className="btn btn-primary" style={{ marginTop: '16px', width: '100%' }} onClick={handleLoadRoutine}>
                    📥 Load Today's Plan: {todayRoutine.name || 'Workout'}
                  </button>
                ) : (
                  <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-mid)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    {isRollingCycle ? "Today is a Rest Day in your cycle!" : "No workouts scheduled for today."}
                  </div>
                )}

                {isRollingCycle && (
                  <button className="btn btn-secondary" style={{ marginTop: '12px', width: '100%', borderColor: 'var(--green-border)' }} onClick={handleAdvanceRollingDay}>
                    ✅ Mark Day Complete (Advance Cycle)
                  </button>
                )}
              </div>
            ) : (
              <p className="hint-text">No schedule yet. Configure your planner to get started!</p>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="ls-cal">{s.calories} cal</span>
                      {(today.deleteChancesUsed || 0) < 5 && (
                        <button onClick={() => removeSport(i)} style={{ background: 'transparent', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }} title="Remove sport">×</button>
                      )}
                    </div>
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

            {activityData.length > 0 && (
              <div className="activity-chart">
                <div className="ac-header">
                  <h4>Calorie Burn Breakdown</h4>
                  <span className="ac-total">{totalDailyBurn} cal total</span>
                </div>

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
              </div>
            )}
          </section>

        </div>

        {/* Modals */}
        {showScheduler && (
          <div className="modal-overlay" onClick={closeModalsAndRefresh}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
              <button className="modal-close" onClick={closeModalsAndRefresh}>×</button>
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
