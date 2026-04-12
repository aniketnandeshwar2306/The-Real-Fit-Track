import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'

export default function WorkoutScheduler() {
  const { showToast } = useToast()
  const [cycleType, setCycleType] = useState('weekly')
  const [cycleLengthWeeks, setCycleLengthWeeks] = useState(2)
  const [routines, setRoutines] = useState([])
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(false)
  const [weekDays, setWeekDays] = useState([])
  const [weeks, setWeeks] = useState([])

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  useEffect(() => {
    loadRoutines()
    loadSchedule()
  }, [])

  async function loadRoutines() {
    try {
      const res = await fetch('/api/workout-routines', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('fittrack_token')}` }
      })
      const data = await res.json()
      setRoutines(data)
    } catch (err) {
      showToast('Failed to load routines', 'error')
    }
  }

  async function loadSchedule() {
    try {
      const res = await fetch('/api/workout-schedules', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('fittrack_token')}` }
      })
      const data = await res.json()
      if (data) {
        setSchedule(data)
        setCycleType(data.cycleType)
        if (data.cycleType === 'weekly') {
          setWeekDays(data.weekDays || [])
        } else {
          setCycleLengthWeeks(data.cycleLengthWeeks)
          setWeeks(data.weeks || [])
        }
      } else {
        initializeSchedule('weekly')
      }
    } catch (err) {
      initializeSchedule('weekly')
    }
  }

  function initializeSchedule(type) {
    if (type === 'weekly') {
      setWeekDays(dayNames.map((_, idx) => ({
        dayOfWeek: idx,
        routineId: null,
        isRestDay: false
      })))
      setCycleType('weekly')
    }
  }

  async function handleSaveSchedule() {
    try {
      setLoading(true)
      const payload = {
        cycleType,
        weekDays: cycleType === 'weekly' ? weekDays : [],
        cycleLengthWeeks: cycleType === 'custom' ? cycleLengthWeeks : 1,
        weeks: cycleType === 'custom' ? weeks : []
      }

      const res = await fetch('/api/workout-schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fittrack_token')}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to save schedule')
      await loadSchedule()
      showToast('Schedule saved successfully', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  function updateDayRoutine(dayIdx, routineId) {
    const updated = [...weekDays]
    updated[dayIdx] = {
      ...updated[dayIdx],
      routineId: routineId || null,
      isRestDay: !routineId
    }
    setWeekDays(updated)
  }

  if (cycleType === 'weekly') {
    return (
      <div className="routine-scheduler">
        <div className="rs-header">
          <h3>Weekly Schedule</h3>
          <select value={cycleType} onChange={e => { setCycleType(e.target.value); initializeSchedule(e.target.value) }}>
            <option value="weekly">Weekly Repeating</option>
            <option value="custom">Custom Cycle</option>
          </select>
        </div>

        <div className="rs-weekly-grid">
          {dayNames.map((day, idx) => {
            const dayData = weekDays[idx] || {}
            const routine = routines.find(r => r._id === dayData.routineId)
            return (
              <div key={idx} className="rs-day-box">
                <h4>{day}</h4>
                <select
                  value={dayData.routineId || ''}
                  onChange={e => updateDayRoutine(idx, e.target.value)}
                  className="rs-routine-select"
                >
                  <option value="">REST DAY</option>
                  {routines.map(r => (
                    <option key={r._id} value={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                {routine && <p className="rs-routine-preview">{routine.exercises.length} exercises</p>}
              </div>
            )
          })}
        </div>

        <div className="rs-actions">
          <button className="btn btn-primary" onClick={handleSaveSchedule} disabled={loading || routines.length === 0}>
            {loading ? 'Saving...' : 'Save Schedule'}
          </button>
          {routines.length === 0 && <p className="rs-hint">💡 Create some routines first</p>}
        </div>
      </div>
    )
  }

  // Custom cycle mode
  return (
    <div className="routine-scheduler">
      <div className="rs-header">
        <h3>Custom Cycle</h3>
        <select value={cycleType} onChange={e => { setCycleType(e.target.value); initializeSchedule(e.target.value) }}>
          <option value="weekly">Weekly Repeating</option>
          <option value="custom">Custom Cycle</option>
        </select>
      </div>

      <div className="rs-cycle-config">
        <label>
          Cycle Length (weeks):
          <input
            type="number"
            min="2"
            max="12"
            value={cycleLengthWeeks}
            onChange={e => setCycleLengthWeeks(parseInt(e.target.value))}
          />
        </label>
      </div>

      <div className="rs-cycle-grid">
        {Array(cycleLengthWeeks).fill(0).map((_, weekIdx) => (
          <div key={weekIdx} className="rs-week">
            <h4>Week {weekIdx + 1}</h4>
            <div className="rs-week-days">
              {dayNames.map((day, dayIdx) => (
                <div key={dayIdx} className="rs-day-mini">
                  <span className="rs-day-label">{day.slice(0, 3)}</span>
                  <select
                    className="rs-select-mini"
                    value={(weeks[weekIdx]?.find(d => d.dayOfWeek === dayIdx)?.routineId) || ''}
                    onChange={e => {
                      const newWeeks = [...weeks]
                      if (!newWeeks[weekIdx]) newWeeks[weekIdx] = []
                      const dayData = newWeeks[weekIdx].find(d => d.dayOfWeek === dayIdx) || {
                        dayOfWeek: dayIdx,
                        routineId: null,
                        isRestDay: false
                      }
                      dayData.routineId = e.target.value || null
                      dayData.isRestDay = !e.target.value

                      const idx = newWeeks[weekIdx].findIndex(d => d.dayOfWeek === dayIdx)
                      if (idx >= 0) {
                        newWeeks[weekIdx][idx] = dayData
                      } else {
                        newWeeks[weekIdx].push(dayData)
                      }
                      setWeeks(newWeeks)
                    }}
                  >
                    <option value="">REST</option>
                    {routines.map(r => (
                      <option key={r._id} value={r._id}>
                        {r.name.slice(0, 12)}...
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rs-actions">
        <button className="btn btn-primary" onClick={handleSaveSchedule} disabled={loading || routines.length === 0}>
          {loading ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>
    </div>
  )
}
