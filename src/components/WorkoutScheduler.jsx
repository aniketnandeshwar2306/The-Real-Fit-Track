import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'

export default function WorkoutScheduler() {
  const { showToast } = useToast()
  const [cycleType, setCycleType] = useState('weekly')
  const [cycleLengthDays, setCycleLengthDays] = useState(3)
  const [loading, setLoading] = useState(false)
  const [weekDays, setWeekDays] = useState([])
  const [rollingDays, setRollingDays] = useState([])

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  useEffect(() => {
    loadSchedule()
  }, [])

  function createEmptyDay(dayOfWeekOrIndex, isWeekly) {
    return {
      ...(isWeekly ? { dayOfWeek: dayOfWeekOrIndex } : { dayIndex: dayOfWeekOrIndex }),
      name: '',
      isRestDay: false,
      exercises: []
    }
  }

  async function loadSchedule() {
    try {
      const res = await fetch('/api/workout-schedules', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('fittrack_token')}` }
      })
      const data = await res.json()
      if (data) {
        setCycleType(data.cycleType)
        if (data.cycleType === 'weekly') {
          setWeekDays(data.weekDays?.length ? data.weekDays : dayNames.map((_, i) => createEmptyDay(i, true)))
        } else {
          setCycleLengthDays(data.cycleLengthDays || 3)
          setRollingDays(data.rollingDays?.length ? data.rollingDays : Array(data.cycleLengthDays || 3).fill(0).map((_, i) => createEmptyDay(i, false)))
        }
      } else {
        initializeSchedule('weekly', 3)
      }
    } catch (err) {
      initializeSchedule('weekly', 3)
    }
  }

  function initializeSchedule(type, length) {
    if (type === 'weekly') {
      setWeekDays(dayNames.map((_, idx) => createEmptyDay(idx, true)))
    } else {
      setRollingDays(Array(length).fill(0).map((_, idx) => createEmptyDay(idx, false)))
    }
    setCycleType(type)
  }

  function handleTypeChange(type) {
    setCycleType(type)
    if (type === 'weekly' && weekDays.length === 0) {
      setWeekDays(dayNames.map((_, idx) => createEmptyDay(idx, true)))
    }
    if (type === 'rolling' && rollingDays.length === 0) {
      setRollingDays(Array(cycleLengthDays).fill(0).map((_, idx) => createEmptyDay(idx, false)))
    }
  }

  function handleCycleLengthChange(length) {
    const newLen = parseInt(length) || 1
    if (newLen > 30) return // Max 30 days
    setCycleLengthDays(newLen)
    const newRolling = [...rollingDays]
    if (newLen > newRolling.length) {
      for (let i = newRolling.length; i < newLen; i++) {
        newRolling.push(createEmptyDay(i, false))
      }
    } else {
      newRolling.splice(newLen)
    }
    setRollingDays(newRolling)
  }

  // Update a day's basic fields
  function updateDayField(isWeekly, index, field, value) {
    if (isWeekly) {
      const updated = [...weekDays]
      updated[index] = { ...updated[index], [field]: value }
      setWeekDays(updated)
    } else {
      const updated = [...rollingDays]
      updated[index] = { ...updated[index], [field]: value }
      setRollingDays(updated)
    }
  }

  // Exercise array mutators
  function addExercise(isWeekly, dayIndex) {
    const scheduleArr = isWeekly ? [...weekDays] : [...rollingDays]
    const current = scheduleArr[dayIndex]
    current.exercises.push({ name: '', sets: '', reps: '', weight: '' })
    if (isWeekly) setWeekDays(scheduleArr)
    else setRollingDays(scheduleArr)
  }

  function updateExercise(isWeekly, dayIndex, exIndex, field, value) {
    const scheduleArr = isWeekly ? [...weekDays] : [...rollingDays]
    scheduleArr[dayIndex].exercises[exIndex][field] = value
    if (isWeekly) setWeekDays(scheduleArr)
    else setRollingDays(scheduleArr)
  }

  function removeExercise(isWeekly, dayIndex, exIndex) {
    const scheduleArr = isWeekly ? [...weekDays] : [...rollingDays]
    scheduleArr[dayIndex].exercises.splice(exIndex, 1)
    if (isWeekly) setWeekDays(scheduleArr)
    else setRollingDays(scheduleArr)
  }

  async function handleSaveSchedule() {
    try {
      setLoading(true)
      const payload = {
        cycleType,
        weekDays: cycleType === 'weekly' ? weekDays : [],
        cycleLengthDays: cycleType === 'rolling' ? cycleLengthDays : 3,
        rollingDays: cycleType === 'rolling' ? rollingDays : []
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

  const currentDays = cycleType === 'weekly' ? weekDays : rollingDays

  return (
    <div className="routine-scheduler" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '80px' }}>
      <div className="rs-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Unified Schedule Planner</h3>
        <select value={cycleType} onChange={e => handleTypeChange(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: '#fff' }}>
          <option value="weekly">Weekly Repeating (7-day)</option>
          <option value="rolling">Rolling Cycle (N-days)</option>
        </select>
      </div>

      {cycleType === 'rolling' && (
        <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <label style={{ display: 'flex', gap: '12px', alignItems: 'center', fontWeight: '500' }}>
            Days in Rolling Cycle (max 30):
            <input 
              type="number" min="1" max="30" 
              value={cycleLengthDays} 
              onChange={e => handleCycleLengthChange(e.target.value)} 
              style={{ width: '80px', padding: '6px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: '#fff' }}
            />
          </label>
        </div>
      )}

      <div className="rs-days-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {currentDays.map((dayData, idx) => {
          const isWeekly = cycleType === 'weekly'
          const label = isWeekly ? dayNames[idx] : `Cycle Day ${idx + 1}`

          return (
            <div key={idx} className="rs-day-block" style={{ padding: '20px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--text-bright)' }}>{label}</h4>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: dayData.isRestDay ? 'var(--text-dim)' : 'var(--text)' }}>
                  <input type="checkbox" checked={dayData.isRestDay} onChange={e => updateDayField(isWeekly, idx, 'isRestDay', e.target.checked)} />
                  Mark as Rest Day
                </label>
              </div>

              {!dayData.isRestDay && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Name this Day (e.g. Chest & Triceps)</label>
                    <input 
                      type="text" value={dayData.name} 
                      onChange={e => updateDayField(isWeekly, idx, 'name', e.target.value)} 
                      placeholder="Enter day name..."
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-input)', background: 'var(--bg-input)', color: 'var(--text)', width: '100%', maxWidth: '400px' }}
                    />
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-dim)' }}>Exercises</h5>
                    
                    {dayData.exercises.map((ex, exIdx) => (
                      <div key={exIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                        <input type="text" placeholder="Exercise" value={ex.name} onChange={e => updateExercise(isWeekly, idx, exIdx, 'name', e.target.value)} style={{ flex: 2, padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: '#fff' }} />
                        <input type="text" placeholder="Sets" value={ex.sets} onChange={e => updateExercise(isWeekly, idx, exIdx, 'sets', e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: '#fff' }} />
                        <input type="text" placeholder="Reps" value={ex.reps} onChange={e => updateExercise(isWeekly, idx, exIdx, 'reps', e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: '#fff' }} />
                        <input type="text" placeholder="Weight" value={ex.weight} onChange={e => updateExercise(isWeekly, idx, exIdx, 'weight', e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: '#fff' }} />
                        <button onClick={() => removeExercise(isWeekly, idx, exIdx)} style={{ background: 'transparent', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '20px', padding: '0 8px' }} title="Remove exercise">×</button>
                      </div>
                    ))}
                    
                    <button onClick={() => addExercise(isWeekly, idx)} style={{ marginTop: '8px', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', transition: 'background 0.2s' }}>
                      + Add Exercise
                    </button>
                  </div>
                </>
              )}

              {dayData.isRestDay && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontStyle: 'italic', background: 'var(--bg-body)', borderRadius: '8px' }}>
                  Rest and recovery planned for this day.
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ position: 'fixed', bottom: '20px', right: '40px', padding: '16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
        <button onClick={handleSaveSchedule} disabled={loading} style={{ background: 'var(--green)', color: '#0a0a0a', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Saving...' : 'Save Unified Schedule'}
        </button>
      </div>
    </div>
  )
}
