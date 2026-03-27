import { useState } from 'react'
import { useFitTrack } from '../context/FitTrackContext'
import DashNav from '../components/DashNav'
import Footer from '../components/Footer'
import './Progress.css'

// Simulated historical data (in production this comes from DB)
function generateHistory(profile) {
  const days = []
  const baseWeight = profile?.weight || 70
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    days.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      weight: +(baseWeight - (30 - i) * 0.05 + (Math.random() - 0.4) * 0.6).toFixed(1),
      calories: Math.round(1600 + Math.random() * 800),
      workouts: Math.random() > 0.35 ? 1 : 0,
      water: Math.round(1500 + Math.random() * 2000),
      steps: Math.round(3000 + Math.random() * 9000),
    })
  }
  return days
}

export default function Progress() {
  const { profile, today, tdee, bmr, caloriesBurned } = useFitTrack()
  const [tab, setTab] = useState('overview')
  const [weightInput, setWeightInput] = useState('')
  const [weightLog, setWeightLog] = useState(() => {
    const saved = localStorage.getItem('fittrack_weights')
    return saved ? JSON.parse(saved) : []
  })
  const [toast, setToast] = useState('')

  const history = generateHistory(profile)

  // Stats
  const workoutDays = history.filter(d => d.workouts > 0).length
  const currentStreak = (() => {
    let streak = 0
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].workouts > 0) streak++
      else break
    }
    return streak
  })()
  const avgCalories = Math.round(history.reduce((s, d) => s + d.calories, 0) / history.length)
  const avgWater = Math.round(history.reduce((s, d) => s + d.water, 0) / history.length)
  const avgSteps = Math.round(history.reduce((s, d) => s + d.steps, 0) / history.length)
  const weightStart = history[0]?.weight || 0
  const weightEnd = history[history.length - 1]?.weight || 0
  const weightChange = +(weightEnd - weightStart).toFixed(1)

  function logWeight() {
    const w = parseFloat(weightInput)
    if (!w || w < 20 || w > 300) return
    const entry = { date: new Date().toISOString().slice(0, 10), weight: w, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }
    const updated = [...weightLog, entry]
    setWeightLog(updated)
    localStorage.setItem('fittrack_weights', JSON.stringify(updated))
    setWeightInput('')
    setToast(`Weight logged: ${w} kg ✅`)
    setTimeout(() => setToast(''), 2500)
  }

  // Chart helpers
  const maxCal = Math.max(...history.map(d => d.calories))
  const maxWeight = Math.max(...history.map(d => d.weight))
  const minWeight = Math.min(...history.map(d => d.weight))
  const weightRange = maxWeight - minWeight || 1

  return (
    <div className="dashboard">
      <DashNav />
      <main className="dash-main">
        <h1 className="page-title animate-slide-up">PROGRESS</h1>
        <p className="page-sub animate-slide-up delay-1">Track your journey, see your growth, celebrate every win.</p>

        {/* Tabs */}
        <div className="progress-tabs animate-slide-up delay-2">
          {['overview', 'weight', 'calories', 'activity'].map(t => (
            <button key={t} className={`ptab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'overview' && '📊'} {t === 'weight' && '⚖️'} {t === 'calories' && '🔥'} {t === 'activity' && '🏃'}
              {' '}{t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ===== OVERVIEW TAB ===== */}
        {tab === 'overview' && (
          <div className="prog-content animate-fade-in">
            <div className="prog-stats-grid">
              <div className="prog-stat">
                <div className="ps-icon">🔥</div>
                <div className="ps-value">{currentStreak}</div>
                <div className="ps-label">Day Streak</div>
              </div>
              <div className="prog-stat">
                <div className="ps-icon">🏋️</div>
                <div className="ps-value">{workoutDays}<span>/30</span></div>
                <div className="ps-label">Workout Days</div>
              </div>
              <div className="prog-stat">
                <div className="ps-icon">⚡</div>
                <div className="ps-value">{avgCalories}</div>
                <div className="ps-label">Avg Calories/Day</div>
              </div>
              <div className="prog-stat">
                <div className="ps-icon">💧</div>
                <div className="ps-value">{(avgWater / 1000).toFixed(1)}L</div>
                <div className="ps-label">Avg Water/Day</div>
              </div>
              <div className="prog-stat">
                <div className="ps-icon">👣</div>
                <div className="ps-value">{avgSteps.toLocaleString()}</div>
                <div className="ps-label">Avg Steps/Day</div>
              </div>
              <div className="prog-stat">
                <div className="ps-icon">⚖️</div>
                <div className={`ps-value ${weightChange <= 0 ? 'green-text' : 'red-text'}`}>{weightChange > 0 ? '+' : ''}{weightChange}kg</div>
                <div className="ps-label">Weight Change (30d)</div>
              </div>
            </div>

            {/* Mini heatmap - workout consistency */}
            <div className="consistency-card">
              <h3>Workout Consistency — Last 30 Days</h3>
              <div className="heatmap">
                {history.map((d, i) => (
                  <div key={i} className={`heatmap-cell ${d.workouts > 0 ? 'active' : ''}`} title={`${d.label}: ${d.workouts > 0 ? 'Worked out' : 'Rest day'}`}>
                    <span className="hc-day">{d.label.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
              <div className="heatmap-legend">
                <span><span className="hl-box rest"></span> Rest</span>
                <span><span className="hl-box worked"></span> Worked Out</span>
              </div>
            </div>
          </div>
        )}

        {/* ===== WEIGHT TAB ===== */}
        {tab === 'weight' && (
          <div className="prog-content animate-fade-in">
            <div className="weight-logger">
              <h3>Log Today's Weight</h3>
              <div className="wl-row">
                <input type="number" placeholder="e.g. 70.5" value={weightInput}
                  onChange={e => setWeightInput(e.target.value)} min="20" max="300" step="0.1" />
                <span className="wl-unit">kg</span>
                <button className="btn btn-primary" onClick={logWeight}>Log Weight</button>
              </div>
            </div>

            <div className="weight-chart-card">
              <h3>Weight Trend — Last 30 Days</h3>
              <div className="line-chart">
                <svg viewBox="0 0 600 200" className="lc-svg">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map(i => (
                    <line key={i} x1="0" y1={i * 50} x2="600" y2={i * 50} stroke="rgba(255,255,255,0.04)" />
                  ))}
                  {/* Line */}
                  <polyline fill="none" stroke="var(--green)" strokeWidth="2" strokeLinejoin="round"
                    points={history.map((d, i) => `${i * 20 + 10},${200 - ((d.weight - minWeight) / weightRange) * 180 - 10}`).join(' ')} />
                  {/* Dots */}
                  {history.map((d, i) => (
                    <circle key={i} cx={i * 20 + 10} cy={200 - ((d.weight - minWeight) / weightRange) * 180 - 10}
                      r="3" fill="var(--green)" opacity={i === history.length - 1 ? 1 : 0.4} />
                  ))}
                  {/* Labels */}
                  {history.filter((_, i) => i % 5 === 0).map((d, i) => (
                    <text key={i} x={i * 100 + 10} y="198" fill="#555" fontSize="8" textAnchor="middle">{d.label}</text>
                  ))}
                </svg>
                <div className="lc-range">
                  <span>{minWeight} kg</span>
                  <span>{maxWeight} kg</span>
                </div>
              </div>
            </div>

            {weightLog.length > 0 && (
              <div className="weight-history">
                <h3>Your Weight Log</h3>
                {[...weightLog].reverse().map((w, i) => (
                  <div className="wh-item" key={i}>
                    <span className="wh-date">{w.date}</span>
                    <span className="wh-time">{w.time}</span>
                    <span className="wh-weight">{w.weight} kg</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== CALORIES TAB ===== */}
        {tab === 'calories' && (
          <div className="prog-content animate-fade-in">
            <div className="calorie-chart-card">
              <h3>Daily Calorie Intake — Last 30 Days</h3>
              <div className="cal-bar-chart">
                {history.map((d, i) => {
                  const pct = maxCal > 0 ? (d.calories / maxCal) * 100 : 0
                  const overTarget = tdee > 0 && d.calories > tdee
                  return (
                    <div key={i} className="cbc-bar" title={`${d.label}: ${d.calories} cal`}>
                      <div className="cbc-fill" style={{ height: `${pct}%`, background: overTarget ? 'var(--red)' : 'var(--green)' }}></div>
                      {i % 5 === 0 && <span className="cbc-label">{d.label.split(' ')[0]}</span>}
                    </div>
                  )
                })}
              </div>
              {tdee > 0 && (
                <div className="cbc-target-line">
                  <span>Target: {tdee} cal/day</span>
                </div>
              )}
            </div>

            <div className="cal-summary-row">
              <div className="cs-card">
                <div className="cs-val">{avgCalories}</div>
                <div className="cs-lbl">Avg Daily Intake</div>
              </div>
              <div className="cs-card">
                <div className="cs-val">{tdee || '—'}</div>
                <div className="cs-lbl">TDEE Target</div>
              </div>
              <div className="cs-card">
                <div className={`cs-val ${avgCalories > tdee ? 'red-text' : 'green-text'}`}>
                  {tdee ? (avgCalories > tdee ? '+' : '') + (avgCalories - tdee) : '—'}
                </div>
                <div className="cs-lbl">Avg Surplus/Deficit</div>
              </div>
            </div>
          </div>
        )}

        {/* ===== ACTIVITY TAB ===== */}
        {tab === 'activity' && (
          <div className="prog-content animate-fade-in">
            <div className="activity-overview">
              <h3>Daily Steps — Last 30 Days</h3>
              <div className="steps-chart">
                {history.map((d, i) => {
                  const pct = (d.steps / 12000) * 100
                  return (
                    <div key={i} className="sc-bar" title={`${d.label}: ${d.steps.toLocaleString()} steps`}>
                      <div className="sc-fill" style={{ height: `${Math.min(100, pct)}%` }}></div>
                      {i % 5 === 0 && <span className="sc-label">{d.label.split(' ')[0]}</span>}
                    </div>
                  )
                })}
              </div>
              <div className="sc-goal"><span>Goal: 10,000 steps/day</span></div>
            </div>

            <div className="records-card">
              <h3>🏆 Personal Records</h3>
              <div className="pr-grid">
                <div className="pr-item">
                  <div className="pr-val">{Math.max(...history.map(d => d.steps)).toLocaleString()}</div>
                  <div className="pr-lbl">Best Steps (1 day)</div>
                </div>
                <div className="pr-item">
                  <div className="pr-val">{currentStreak} days</div>
                  <div className="pr-lbl">Current Streak</div>
                </div>
                <div className="pr-item">
                  <div className="pr-val">{workoutDays}</div>
                  <div className="pr-lbl">Workouts This Month</div>
                </div>
                <div className="pr-item">
                  <div className="pr-val">{Math.max(...history.map(d => d.water))}ml</div>
                  <div className="pr-lbl">Best Water Intake</div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="badges-card">
              <h3>🎖️ Achievements</h3>
              <div className="badges-grid">
                <div className={`badge-item ${workoutDays >= 5 ? 'unlocked' : ''}`}>
                  <span className="bi-icon">💪</span>
                  <span className="bi-name">5 Workouts</span>
                </div>
                <div className={`badge-item ${workoutDays >= 15 ? 'unlocked' : ''}`}>
                  <span className="bi-icon">🔥</span>
                  <span className="bi-name">15 Workouts</span>
                </div>
                <div className={`badge-item ${currentStreak >= 3 ? 'unlocked' : ''}`}>
                  <span className="bi-icon">⚡</span>
                  <span className="bi-name">3-Day Streak</span>
                </div>
                <div className={`badge-item ${currentStreak >= 7 ? 'unlocked' : ''}`}>
                  <span className="bi-icon">🏆</span>
                  <span className="bi-name">7-Day Streak</span>
                </div>
                <div className={`badge-item ${avgWater >= 2500 ? 'unlocked' : ''}`}>
                  <span className="bi-icon">💧</span>
                  <span className="bi-name">Hydration Pro</span>
                </div>
                <div className={`badge-item ${avgSteps >= 8000 ? 'unlocked' : ''}`}>
                  <span className="bi-icon">👣</span>
                  <span className="bi-name">Step Master</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
