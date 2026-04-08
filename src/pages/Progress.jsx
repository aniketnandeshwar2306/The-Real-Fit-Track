import { useState, useEffect, useRef } from 'react'
import { useFitTrack } from '../context/FitTrackContext'
import DashNav from '../components/DashNav'
import Footer from '../components/Footer'
import './Progress.css'

/* ── Animated counter hook ── */
function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    if (target === 0) { setVal(0); return }
    let start = 0
    const step = target / (duration / 16)
    ref.current = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(ref.current) }
      else setVal(Math.round(start))
    }, 16)
    return () => clearInterval(ref.current)
  }, [target, duration])
  return val
}

/* ── SVG ring component ── */
function ProgressRing({ percent, size = 120, stroke = 8, color = 'var(--green)', label, sub }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(percent, 100) / 100) * circ
  return (
    <div className="prog-ring-wrap">
      <svg width={size} height={size} className="prog-ring-svg">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
      </svg>
      <div className="prog-ring-label">
        <span className="prl-val">{label}</span>
        <span className="prl-sub">{sub}</span>
      </div>
    </div>
  )
}

/* ── ChartTooltip ── */
function ChartTooltip({ data, x, y, visible }) {
  if (!visible || !data) return null
  return (
    <div className="chart-tooltip" style={{ left: x, top: y }}>
      <div className="ct-date">{data.label}</div>
      {data.weight != null && <div className="ct-row"><span>Weight</span><span>{data.weight} kg</span></div>}
      {data.calories != null && <div className="ct-row"><span>Calories</span><span>{data.calories} cal</span></div>}
      {data.water != null && <div className="ct-row"><span>Water</span><span>{data.water} ml</span></div>}
      {data.workoutsDone != null && <div className="ct-row"><span>Workouts</span><span>{data.workoutsDone}</span></div>}
    </div>
  )
}

export default function Progress() {
  const { profile, today, tdee, bmr, caloriesBurned, fetchProgressHistory } = useFitTrack()
  const [tab, setTab] = useState('overview')
  const [weightInput, setWeightInput] = useState('')
  const [weightLog, setWeightLog] = useState(() => {
    const saved = localStorage.getItem('fittrack_weights')
    return saved ? JSON.parse(saved) : []
  })
  const [toast, setToast] = useState('')
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [tooltip, setTooltip] = useState({ visible: false, data: null, x: 0, y: 0 })
  const chartRef = useRef(null)

  // Fetch real data from API
  useEffect(() => {
    async function load() {
      setLoadingHistory(true)
      const daysMap = await fetchProgressHistory(30)
      
      // Convert the days map to a sorted array
      const entries = Object.entries(daysMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dateKey, day]) => {
          const d = new Date(dateKey + 'T00:00:00')
          const workoutsDone = (day.workouts || []).filter(w => w.done).length
          const workoutCals = (day.workouts || []).filter(w => w.done).reduce((s, w) => s + (w.calories || 0), 0)
          const sportCals = (day.sports || []).reduce((s, sp) => s + (sp.calories || 0), 0)
          return {
            date: dateKey,
            label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            calories: day.caloriesConsumed || 0,
            water: day.waterMl || 0,
            workoutsDone,
            totalWorkouts: (day.workouts || []).length,
            caloriesBurned: workoutCals + sportCals,
            sports: day.sports || [],
            activities: day.activities || [],
            meals: day.meals || [],
          }
        })

      // If no history, generate today as a single entry
      if (entries.length === 0) {
        const now = new Date()
        entries.push({
          date: now.toISOString().slice(0, 10),
          label: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          calories: today.caloriesConsumed || 0,
          water: today.waterMl || 0,
          workoutsDone: today.workouts.filter(w => w.done).length,
          totalWorkouts: today.workouts.length,
          caloriesBurned: 0,
          sports: today.sports || [],
          activities: today.activities || [],
          meals: today.meals || [],
        })
      }

      setHistory(entries)
      setLoadingHistory(false)
    }
    load()
  }, [])

  // Stats
  const workoutDays = history.filter(d => d.workoutsDone > 0).length
  const currentStreak = (() => {
    let streak = 0
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].workoutsDone > 0) streak++
      else break
    }
    return streak
  })()
  const totalCalories = history.reduce((s, d) => s + d.calories, 0)
  const avgCalories = history.length ? Math.round(totalCalories / history.length) : 0
  const totalWater = history.reduce((s, d) => s + d.water, 0)
  const avgWater = history.length ? Math.round(totalWater / history.length) : 0
  const totalBurned = history.reduce((s, d) => s + d.caloriesBurned, 0)

  // Animated counters
  const animStreak = useCountUp(currentStreak, 800)
  const animWorkoutDays = useCountUp(workoutDays, 1000)
  const animAvgCalories = useCountUp(avgCalories, 1200)
  const animAvgWater = useCountUp(avgWater, 1200)
  const animTotalBurned = useCountUp(totalBurned, 1400)

  // Today progress
  const todayCalProgress = tdee > 0 ? Math.min(100, Math.round((today.caloriesConsumed / tdee) * 100)) : 0
  const todayWorkoutProgress = today.workouts.length > 0 ? Math.round((today.workouts.filter(w => w.done).length / today.workouts.length) * 100) : 0
  const todayWaterProgress = Math.min(100, Math.round((today.waterMl / 3000) * 100))

  // Weight chart data
  const weightData = weightLog.length > 0
    ? weightLog.slice(-30).map(w => ({ ...w, label: new Date(w.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }))
    : (profile ? [{ weight: profile.weight, label: 'Current', date: 'now' }] : [])

  const maxWeight = weightData.length ? Math.max(...weightData.map(d => d.weight)) : 0
  const minWeight = weightData.length ? Math.min(...weightData.map(d => d.weight)) : 0
  const weightRange = maxWeight - minWeight || 1

  // Calorie chart
  const maxCal = history.length ? Math.max(...history.map(d => d.calories), 1) : 1

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

  function handleChartHover(e, data) {
    const rect = chartRef.current?.getBoundingClientRect()
    if (!rect) return
    setTooltip({
      visible: true,
      data,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 60,
    })
  }

  // This week's data
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  const weekKey = weekStart.toISOString().slice(0, 10)
  const thisWeek = history.filter(d => d.date >= weekKey)
  const weekCalories = thisWeek.reduce((s, d) => s + d.calories, 0)
  const weekWorkouts = thisWeek.filter(d => d.workoutsDone > 0).length
  const weekWater = thisWeek.length ? Math.round(thisWeek.reduce((s, d) => s + d.water, 0) / thisWeek.length) : 0

  // Goal targets (use profile settings or defaults)
  const calorieTarget = profile?.calorieTarget || tdee
  const waterGoal = profile?.waterGoal || 3000
  const workoutTarget = profile?.dailyWorkoutTarget || 1

  // Weekly goals achievement
  const weekCaloriesAchieved = weekCalories
  const weekCalorieTarget = calorieTarget * thisWeek.length
  const weekCaloriePercent = weekCalorieTarget > 0 ? Math.round((weekCaloriesAchieved / weekCalorieTarget) * 100) : 0

  const weekWaterAchieved = thisWeek.reduce((s, d) => s + d.water, 0)
  const weekWaterTarget = waterGoal * thisWeek.length
  const weekWaterPercent = weekWaterTarget > 0 ? Math.round((weekWaterAchieved / weekWaterTarget) * 100) : 0

  const weekWorkoutDates = thisWeek.filter(d => d.workoutsDone >= workoutTarget).length
  const weekWorkoutTarget = thisWeek.length
  const weekWorkoutPercent = weekWorkoutTarget > 0 ? Math.round((weekWorkoutDates / weekWorkoutTarget) * 100) : 0

  // Deficit/Surplus data
  const deficitData = history.map(d => ({
    date: d.date,
    label: d.label,
    consumed: d.calories,
    target: calorieTarget,
    balance: calorieTarget - d.calories,
    isDeficit: calorieTarget > d.calories
  }))

  const maxDeficit = Math.max(...deficitData.map(d => Math.abs(d.balance)), 1)
  const weekDeficit = thisWeek.reduce((sum, d) => sum + (calorieTarget - d.calories), 0)
  const estimatedLossLbs = (weekDeficit / 3500).toFixed(2)
  const estimatedLossKg = (weekDeficit / 7700).toFixed(2)

  // Badges
  const badges = [
    { icon: '💪', name: 'First Workout', unlocked: workoutDays >= 1 },
    { icon: '🔥', name: '5-Day Streak', unlocked: currentStreak >= 5 },
    { icon: '⚡', name: '15 Workouts', unlocked: workoutDays >= 15 },
    { icon: '🏆', name: '7-Day Streak', unlocked: currentStreak >= 7 },
    { icon: '💧', name: 'Hydration Pro', unlocked: avgWater >= 2500 },
    { icon: '🎯', name: 'Calorie King', unlocked: avgCalories > 0 && tdee > 0 && Math.abs(avgCalories - tdee) < 200 },
  ]

  if (loadingHistory) {
    return (
      <div className="dashboard">
        <DashNav />
        <main className="dash-main">
          <div className="progress-loading">
            <div className="pl-spinner"></div>
            <p>Loading your progress...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <DashNav />
      <main className="dash-main">
        <h1 className="page-title animate-slide-up">PROGRESS</h1>
        <p className="page-sub animate-slide-up delay-1">Track your journey, see your growth, celebrate every win.</p>

        {/* Today's Summary Rings */}
        <div className="today-rings animate-slide-up delay-2">
          <ProgressRing percent={todayCalProgress} color="#ff6b35" size={110} label={`${todayCalProgress}%`} sub="Calories" />
          <ProgressRing percent={todayWorkoutProgress} color="var(--green)" size={110} label={`${todayWorkoutProgress}%`} sub="Workouts" />
          <ProgressRing percent={todayWaterProgress} color="#4488ff" size={110} label={`${todayWaterProgress}%`} sub="Water" />
        </div>

        {/* Tabs */}
        <div className="progress-tabs animate-slide-up delay-3">
          {['overview', 'weight', 'calories', 'activity', 'deficit'].map(t => (
            <button key={t} className={`ptab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'overview' && '📊'} {t === 'weight' && '⚖️'} {t === 'calories' && '🔥'} {t === 'activity' && '🏃'} {t === 'deficit' && '📉'}
              {' '}{t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ===== OVERVIEW ===== */}
        {tab === 'overview' && (
          <div className="prog-content animate-fade-in">
            {/* Weekly Recap */}
            <div className="weekly-recap">
              <h3>📅 This Week's Recap</h3>
              <div className="wr-grid">
                <div className="wr-item">
                  <span className="wr-val">{weekCalories.toLocaleString()}</span>
                  <span className="wr-lbl">Calories Consumed</span>
                </div>
                <div className="wr-item">
                  <span className="wr-val">{weekWorkouts}</span>
                  <span className="wr-lbl">Workout Days</span>
                </div>
                <div className="wr-item">
                  <span className="wr-val">{(weekWater / 1000).toFixed(1)}L</span>
                  <span className="wr-lbl">Avg Water/Day</span>
                </div>
              </div>
            </div>

            {/* Weekly Goals Achievement */}
            <div className="weekly-goals-card">
              <h3>🎯 Weekly Goals Achievement</h3>
              <div className="weekly-goals-grid">
                {/* Calorie Goal */}
                <div className="goal-card">
                  <div className="gc-header">
                    <span className="gc-icon">🔥</span>
                    <div className="gc-title">
                      <span className="gc-label">Calorie Target</span>
                      <span className="gc-percent">{weekCaloriePercent}%</span>
                    </div>
                  </div>
                  <div className="gc-progress-bar">
                    <div className="gc-fill" style={{
                      width: `${Math.min(weekCaloriePercent, 100)}%`,
                      background: weekCaloriePercent >= 75 ? 'var(--green)' : weekCaloriePercent >= 50 ? '#ffaa22' : '#ff6655'
                    }} />
                  </div>
                  <div className="gc-stats">
                    <span className="gc-stat">{weekCaloriesAchieved.toLocaleString()} / {weekCalorieTarget.toLocaleString()} cal</span>
                  </div>
                </div>

                {/* Water Goal */}
                <div className="goal-card">
                  <div className="gc-header">
                    <span className="gc-icon">💧</span>
                    <div className="gc-title">
                      <span className="gc-label">Water Intake</span>
                      <span className="gc-percent">{weekWaterPercent}%</span>
                    </div>
                  </div>
                  <div className="gc-progress-bar">
                    <div className="gc-fill" style={{
                      width: `${Math.min(weekWaterPercent, 100)}%`,
                      background: weekWaterPercent >= 75 ? '#4488ff' : weekWaterPercent >= 50 ? '#22aaff' : '#ff6655'
                    }} />
                  </div>
                  <div className="gc-stats">
                    <span className="gc-stat">{(weekWaterAchieved / 1000).toFixed(1)} / {(weekWaterTarget / 1000).toFixed(1)} L</span>
                  </div>
                </div>

                {/* Workouts Goal */}
                <div className="goal-card">
                  <div className="gc-header">
                    <span className="gc-icon">🏋️</span>
                    <div className="gc-title">
                      <span className="gc-label">Workout Days</span>
                      <span className="gc-percent">{weekWorkoutPercent}%</span>
                    </div>
                  </div>
                  <div className="gc-progress-bar">
                    <div className="gc-fill" style={{
                      width: `${Math.min(weekWorkoutPercent, 100)}%`,
                      background: weekWorkoutPercent >= 75 ? 'var(--green)' : weekWorkoutPercent >= 50 ? '#ffaa22' : '#ff6655'
                    }} />
                  </div>
                  <div className="gc-stats">
                    <span className="gc-stat">{weekWorkoutDates} / {weekWorkoutTarget} days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="prog-stats-grid">
              <div className="prog-stat glass-stat">
                <div className="ps-icon">🔥</div>
                <div className="ps-value">{animStreak}</div>
                <div className="ps-label">Day Streak</div>
              </div>
              <div className="prog-stat glass-stat">
                <div className="ps-icon">🏋️</div>
                <div className="ps-value">{animWorkoutDays}<span>/{history.length}</span></div>
                <div className="ps-label">Workout Days</div>
              </div>
              <div className="prog-stat glass-stat">
                <div className="ps-icon">⚡</div>
                <div className="ps-value">{animAvgCalories}</div>
                <div className="ps-label">Avg Calories/Day</div>
              </div>
              <div className="prog-stat glass-stat">
                <div className="ps-icon">💧</div>
                <div className="ps-value">{(animAvgWater / 1000).toFixed(1)}L</div>
                <div className="ps-label">Avg Water/Day</div>
              </div>
              <div className="prog-stat glass-stat">
                <div className="ps-icon">🏋️‍♂️</div>
                <div className="ps-value">{animTotalBurned.toLocaleString()}</div>
                <div className="ps-label">Total Cal Burned</div>
              </div>
              <div className="prog-stat glass-stat">
                <div className="ps-icon">📊</div>
                <div className="ps-value">{history.length}</div>
                <div className="ps-label">Days Tracked</div>
              </div>
            </div>

            {/* Heatmap */}
            <div className="consistency-card">
              <h3>Workout Consistency — Last {history.length} Days</h3>
              <div className="heatmap">
                {history.map((d, i) => (
                  <div key={i} className={`heatmap-cell ${d.workoutsDone > 0 ? 'active' : ''}`}
                    title={`${d.label}: ${d.workoutsDone > 0 ? `${d.workoutsDone} done` : 'Rest day'}`}>
                    <span className="hc-day">{d.label.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
              <div className="heatmap-legend">
                <span><span className="hl-box rest"></span> Rest</span>
                <span><span className="hl-box worked"></span> Worked Out</span>
              </div>
            </div>

            {/* Badges */}
            <div className="badges-card">
              <h3>🎖️ Achievements</h3>
              <div className="badges-grid">
                {badges.map((b, i) => (
                  <div className={`badge-item ${b.unlocked ? 'unlocked' : ''}`} key={i}>
                    <span className="bi-icon">{b.icon}</span>
                    <span className="bi-name">{b.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== WEIGHT ===== */}
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

            {weightData.length > 1 && (
              <div className="weight-chart-card" ref={chartRef}>
                <h3>Weight Trend — Last {weightData.length} Entries</h3>
                <div className="line-chart">
                  <svg viewBox="0 0 600 220" className="lc-svg">
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--green)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="var(--green)" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map(i => (
                      <line key={i} x1="0" y1={i * 50} x2="600" y2={i * 50} stroke="rgba(255,255,255,0.04)" />
                    ))}
                    {/* Area fill */}
                    <polygon fill="url(#weightGrad)"
                      points={
                        weightData.map((d, i) => {
                          const x = (i / (weightData.length - 1)) * 580 + 10
                          const y = 200 - ((d.weight - minWeight) / weightRange) * 170 - 10
                          return `${x},${y}`
                        }).join(' ') + ` 590,210 10,210`
                      } />
                    {/* Line */}
                    <polyline fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinejoin="round"
                      className="weight-line-animated"
                      points={weightData.map((d, i) => {
                        const x = (i / (weightData.length - 1)) * 580 + 10
                        const y = 200 - ((d.weight - minWeight) / weightRange) * 170 - 10
                        return `${x},${y}`
                      }).join(' ')} />
                    {/* Dots */}
                    {weightData.map((d, i) => {
                      const x = (i / (weightData.length - 1)) * 580 + 10
                      const y = 200 - ((d.weight - minWeight) / weightRange) * 170 - 10
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r={i === weightData.length - 1 ? 5 : 3}
                            fill="var(--green)" className="chart-dot"
                            opacity={i === weightData.length - 1 ? 1 : 0.5}
                            onMouseEnter={e => handleChartHover(e, { label: d.label, weight: d.weight })}
                            onMouseLeave={() => setTooltip(p => ({ ...p, visible: false }))} />
                          {i === weightData.length - 1 && (
                            <circle cx={x} cy={y} r="8" fill="var(--green)" opacity="0.2" className="dot-pulse" />
                          )}
                        </g>
                      )
                    })}
                    {/* Labels */}
                    {weightData.filter((_, i) => i % Math.ceil(weightData.length / 6) === 0 || i === weightData.length - 1).map((d, idx, arr) => {
                      const i = weightData.indexOf(d)
                      const x = (i / (weightData.length - 1)) * 580 + 10
                      return <text key={idx} x={x} y="218" fill="#555" fontSize="9" textAnchor="middle">{d.label}</text>
                    })}
                  </svg>
                  <ChartTooltip {...tooltip} />
                  <div className="lc-range">
                    <span>{minWeight} kg</span>
                    <span>{maxWeight} kg</span>
                  </div>
                </div>
              </div>
            )}

            {weightData.length <= 1 && (
              <div className="empty-chart-card">
                <span className="ecc-icon">⚖️</span>
                <p>Log your weight regularly to see trends here!</p>
                <p className="ecc-sub">Your first entry will start the chart.</p>
              </div>
            )}

            {weightLog.length > 0 && (
              <div className="weight-history">
                <h3>Your Weight Log</h3>
                {[...weightLog].reverse().slice(0, 10).map((w, i) => (
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

        {/* ===== CALORIES ===== */}
        {tab === 'calories' && (
          <div className="prog-content animate-fade-in">
            <div className="calorie-chart-card" ref={chartRef}>
              <h3>Daily Calorie Intake — Last {history.length} Days</h3>
              <div className="cal-bar-chart">
                {history.map((d, i) => {
                  const pct = maxCal > 0 ? (d.calories / maxCal) * 100 : 0
                  const overTarget = tdee > 0 && d.calories > tdee
                  return (
                    <div key={i} className="cbc-bar"
                      onMouseEnter={e => handleChartHover(e, { label: d.label, calories: d.calories })}
                      onMouseLeave={() => setTooltip(p => ({ ...p, visible: false }))}>
                      <div className="cbc-fill" style={{
                        height: `${pct}%`,
                        background: overTarget
                          ? 'linear-gradient(180deg, #ff4444, #cc2222)'
                          : 'linear-gradient(180deg, var(--green), #88cc00)'
                      }}></div>
                      {i % Math.ceil(history.length / 6) === 0 && (
                        <span className="cbc-label">{d.label.split(' ')[0]}</span>
                      )}
                    </div>
                  )
                })}
              </div>
              <ChartTooltip {...tooltip} />
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

            {/* Meals breakdown for today */}
            {today.meals.length > 0 && (
              <div className="today-meals-card">
                <h3>🍽️ Today's Meals</h3>
                {today.meals.map((m, i) => (
                  <div className="tm-row" key={i}>
                    <span className="tm-name">{m.name}</span>
                    <span className="tm-cal">{m.calories} cal</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== ACTIVITY ===== */}
        {tab === 'activity' && (
          <div className="prog-content animate-fade-in">
            {/* Calories burned chart */}
            <div className="activity-overview">
              <h3>Calories Burned — Last {history.length} Days</h3>
              <div className="steps-chart">
                {history.map((d, i) => {
                  const maxBurned = Math.max(...history.map(h => h.caloriesBurned), 1)
                  const pct = (d.caloriesBurned / maxBurned) * 100
                  return (
                    <div key={i} className="sc-bar"
                      title={`${d.label}: ${d.caloriesBurned} cal burned`}
                      onMouseEnter={e => handleChartHover(e, { label: d.label, calories: d.caloriesBurned })}
                      onMouseLeave={() => setTooltip(p => ({ ...p, visible: false }))}>
                      <div className="sc-fill" style={{ height: `${Math.min(100, pct)}%` }}></div>
                      {i % Math.ceil(history.length / 6) === 0 && (
                        <span className="sc-label">{d.label.split(' ')[0]}</span>
                      )}
                    </div>
                  )
                })}
              </div>
              <ChartTooltip {...tooltip} />
            </div>

            <div className="records-card">
              <h3>🏆 Personal Records</h3>
              <div className="pr-grid">
                <div className="pr-item">
                  <div className="pr-val">{history.length > 0 ? Math.max(...history.map(d => d.caloriesBurned)).toLocaleString() : 0}</div>
                  <div className="pr-lbl">Best Cal Burned (1 day)</div>
                </div>
                <div className="pr-item">
                  <div className="pr-val">{currentStreak} days</div>
                  <div className="pr-lbl">Current Streak</div>
                </div>
                <div className="pr-item">
                  <div className="pr-val">{workoutDays}</div>
                  <div className="pr-lbl">Workouts This Period</div>
                </div>
                <div className="pr-item">
                  <div className="pr-val">{history.length > 0 ? Math.max(...history.map(d => d.water)) : 0}ml</div>
                  <div className="pr-lbl">Best Water Intake</div>
                </div>
              </div>
            </div>

            {/* Today's sport & activity summary */}
            {(today.sports?.length > 0 || today.activities?.length > 0) && (
              <div className="today-activity-card">
                <h3>🏃 Today's Activities</h3>
                {(today.sports || []).map((s, i) => (
                  <div className="ta-row" key={`s${i}`}>
                    <span className="ta-icon">{s.icon || '🏅'}</span>
                    <span className="ta-name">{s.name}</span>
                    <span className="ta-detail">{s.duration} min</span>
                    <span className="ta-cal">{s.calories} cal</span>
                  </div>
                ))}
                {(today.activities || []).map((a, i) => (
                  <div className="ta-row" key={`a${i}`}>
                    <span className="ta-icon">{a.icon || '📍'}</span>
                    <span className="ta-name">{a.name}</span>
                    <span className="ta-detail">{(a.hours * 60)} min</span>
                    <span className="ta-cal">{a.calories} cal</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== DEFICIT/SURPLUS ===== */}
        {tab === 'deficit' && (
          <div className="prog-content animate-fade-in">
            <div className="deficit-chart-card" ref={chartRef}>
              <h3>💰 Calorie Deficit/Surplus — Last {history.length} Days</h3>
              <p className="deficit-info">Green = deficit (good for weight loss) | Red = surplus (overeating)</p>

              <div className="deficit-bar-chart">
                {deficitData.map((d, i) => {
                  const pct = maxDeficit > 0 ? Math.abs((d.balance / maxDeficit) * 100) : 0
                  return (
                    <div key={i} className="dbc-bar"
                      onMouseEnter={e => handleChartHover(e, {
                        label: d.label,
                        calories: d.consumed,
                        target: d.target,
                        deficit: d.balance
                      })}
                      onMouseLeave={() => setTooltip(p => ({ ...p, visible: false }))}>
                      <div className="dbc-fill" style={{
                        height: `${pct}%`,
                        background: d.isDeficit
                          ? 'linear-gradient(180deg, #22cc22, #00aa00)'
                          : 'linear-gradient(180deg, #ff6655, #dd3333)',
                        opacity: 0.8
                      }} />
                      <span className="dbc-value">{Math.round(d.balance)}</span>
                    </div>
                  )
                })}
              </div>
              <ChartTooltip {...tooltip} />
              <div className="dbc-baseline">
                <span>Baseline (0 = target met)</span>
              </div>
            </div>

            {/* Weekly Deficit Summary */}
            <div className="deficit-summary">
              <h3>📊 This Week's Deficit Summary</h3>
              <div className="ds-grid">
                <div className="ds-card">
                  <span className="ds-icon">{weekDeficit >= 0 ? '✅' : '⚠️'}</span>
                  <div className="ds-content">
                    <span className="ds-label">Total Weekly Deficit</span>
                    <span className="ds-value">{Math.abs(weekDeficit).toLocaleString()} cal</span>
                    {weekDeficit >= 0 && <span className="ds-sub">👍 Great! You're in a deficit</span>}
                    {weekDeficit < 0 && <span className="ds-sub">⚠️ You're in a surplus this week</span>}
                  </div>
                </div>

                <div className="ds-card">
                  <span className="ds-icon">⚖️</span>
                  <div className="ds-content">
                    <span className="ds-label">Estimated Fat Loss</span>
                    <span className="ds-value">{estimatedLossLbs} lbs / {estimatedLossKg} kg</span>
                    <span className="ds-sub">Based on 3500 cal = 1 lb loss</span>
                  </div>
                </div>

                <div className="ds-card">
                  <span className="ds-icon">📈</span>
                  <div className="ds-content">
                    <span className="ds-label">Average Daily Deficit</span>
                    <span className="ds-value">{thisWeek.length > 0 ? Math.round(weekDeficit / thisWeek.length) : 0} cal</span>
                    <span className="ds-sub">Per day this week</span>
                  </div>
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
