import { useState, useEffect } from 'react'
import { useFitTrack } from '../context/FitTrackContext'

export default function WorkoutList() {
  const { today, toggleWorkout, updateWorkoutWeight, addCustomWorkout, removeWorkout } = useFitTrack()
  const [editIdx, setEditIdx] = useState(null)
  const [editWeight, setEditWeight] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newEx, setNewEx] = useState({ name: '', sets: '', weight: '', calories: '' })

  function saveWeight(i) {
    if (editWeight.trim()) updateWorkoutWeight(i, editWeight.trim())
    setEditIdx(null)
    setEditWeight('')
  }

  function handleAdd() {
    if (!newEx.name.trim()) return
    addCustomWorkout({
      name: newEx.name,
      sets: newEx.sets || '3 × 10 reps',
      weight: newEx.weight || 'bodyweight',
      calories: parseInt(newEx.calories) || 50,
    })
    setNewEx({ name: '', sets: '', weight: '', calories: '' })
    setShowAdd(false)
  }

  const [isRestDay, setIsRestDay] = useState(false)
  const [checkingSchedule, setCheckingSchedule] = useState(true)

  useEffect(() => {
    async function checkRestDay() {
      if (today.workouts && today.workouts.length > 0) {
        setCheckingSchedule(false);
        return;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/workout-schedules/today-routine/get`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('fittrack_token')}` }
        })
        const data = await res.json()
        if (data && data.isRestDay) {
          setIsRestDay(true)
        }
      } catch (err) {
        console.log('Failed to fetch schedule for rest day check')
      } finally {
        setCheckingSchedule(false)
      }
    }
    checkRestDay()
  }, [today.workouts?.length])

  const doneCount = today.workouts.filter(w => w.done).length

  return (
    <div className="workout-card animate-slide-up delay-3">
      <div className="card-header">
        <h3 className="card-title">Today's Plan</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="badge">{doneCount}/{today.workouts.length} done</span>
          <button className="wl-add-btn" onClick={() => setShowAdd(!showAdd)} title="Add exercise">+</button>
        </div>
      </div>

      {/* Add Exercise Form */}
      {showAdd && (
        <div className="wl-add-form">
          <input type="text" placeholder="Exercise name" value={newEx.name}
            onChange={e => setNewEx({...newEx, name: e.target.value})} className="wl-input" />
          <div className="wl-add-row">
            <input type="text" placeholder="Sets (3 × 10)" value={newEx.sets}
              onChange={e => setNewEx({...newEx, sets: e.target.value})} className="wl-input-sm" />
            <input type="text" placeholder="Weight" value={newEx.weight}
              onChange={e => setNewEx({...newEx, weight: e.target.value})} className="wl-input-sm" />
            <input type="number" placeholder="Cal" value={newEx.calories}
              onChange={e => setNewEx({...newEx, calories: e.target.value})} className="wl-input-sm" />
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleAdd} style={{ width: '100%' }}>Add to Plan →</button>
        </div>
      )}

      <ul className="workout-list">
        {today.workouts.map((w, i) => (
          <li key={i} className={`workout-item ${w.done ? 'done' : ''}`}>
            <div className="workout-check" onClick={() => toggleWorkout(i)} style={{ cursor: 'pointer' }}>
              {w.done ? '✓' : ''}
            </div>
            <div className="workout-details" onClick={() => toggleWorkout(i)} style={{ cursor: 'pointer', flex: 1 }}>
              <div className="workout-name">{w.name}</div>
              <div className="workout-sets">{w.sets} · {w.calories} cal</div>
            </div>
            <div className="workout-weight-area">
              {editIdx === i ? (
                <div className="wl-edit-weight">
                  <input type="text" value={editWeight} onChange={e => setEditWeight(e.target.value)}
                    className="wl-weight-input" autoFocus onKeyDown={e => e.key === 'Enter' && saveWeight(i)} />
                  <button className="wl-save-btn" onClick={() => saveWeight(i)}>✓</button>
                </div>
              ) : (
                <button className="wl-weight-badge" onClick={() => { setEditIdx(i); setEditWeight(w.weight) }}
                  title="Click to change weight">
                  {w.weight}
                </button>
              )}
            </div>
            <button className="wl-remove-btn" onClick={() => removeWorkout(i)} title="Remove">×</button>
          </li>
        ))}
      </ul>
      {today.workouts.length === 0 && !checkingSchedule && (
        isRestDay ? (
          <div className="wl-empty" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌴</div>
            <strong>Rest Day!</strong> Active recovery recommended.
            <div style={{ fontSize: '0.85em', marginTop: '4px', opacity: 0.8 }}>Or manually add exercises above if you want to push it.</div>
          </div>
        ) : (
          <div className="wl-empty">No exercises yet. Add one above or load a plan from the Workouts page!</div>
        )
      )}
      {checkingSchedule && today.workouts.length === 0 && (
        <div className="wl-empty" style={{ opacity: 0.5 }}>Checking schedule...</div>
      )}
    </div>
  )
}
