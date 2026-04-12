import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'

export default function WorkoutRoutineBuilder() {
  const { showToast } = useToast()
  const [mode, setMode] = useState('list') // 'list', 'create', 'edit'
  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', exercises: [] })
  const [editingId, setEditingId] = useState(null)

  // Load routines on mount
  useEffect(() => {
    loadRoutines()
  }, [])

  async function loadRoutines() {
    try {
      setLoading(true)
      const res = await fetch('/api/workout-routines', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('fittrack_token')}` }
      })
      const data = await res.json()
      setRoutines(data)
    } catch (err) {
      showToast('Failed to load routines', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveRoutine() {
    if (!formData.name.trim()) {
      showToast('Routine name is required', 'error')
      return
    }

    try {
      setLoading(true)
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/workout-routines/${editingId}` : '/api/workout-routines'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fittrack_token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          exercises: formData.exercises.filter(e => e.name.trim())
        })
      })

      if (!res.ok) throw new Error('Failed to save routine')
      await loadRoutines()
      setFormData({ name: '', description: '', exercises: [] })
      setEditingId(null)
      setMode('list')
      showToast(editingId ? 'Routine updated' : 'Routine created', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteRoutine(id) {
    if (!confirm('Delete this routine?')) return

    try {
      const res = await fetch(`/api/workout-routines/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('fittrack_token')}` }
      })
      if (!res.ok) throw new Error('Failed to delete')
      await loadRoutines()
      showToast('Routine deleted', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  function addExercise() {
    setFormData({
      ...formData,
      exercises: [...formData.exercises, { name: '', sets: '', reps: '', weight: '' }]
    })
  }

  function removeExercise(idx) {
    setFormData({
      ...formData,
      exercises: formData.exercises.filter((_, i) => i !== idx)
    })
  }

  function updateExercise(idx, field, value) {
    const updated = [...formData.exercises]
    updated[idx] = { ...updated[idx], [field]: value }
    setFormData({ ...formData, exercises: updated })
  }

  if (mode === 'create' || mode === 'edit') {
    return (
      <div className="routine-builder">
        <div className="rb-header">
          <h3>{editingId ? 'Edit Routine' : 'Create New Routine'}</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => { setMode('list'); setEditingId(null); setFormData({ name: '', description: '', exercises: [] }) }}>
            ← Back
          </button>
        </div>

        <div className="rb-form">
          <div className="rb-field">
            <label>Routine Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Chest & Triceps"
            />
          </div>

          <div className="rb-field">
            <label>Description (optional)</label>
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., 4 exercises, 60 min"
            />
          </div>

          <div className="rb-exercises">
            <h4>Exercises</h4>
            {formData.exercises.map((ex, idx) => (
              <div key={idx} className="rb-exercise-row">
                <input
                  type="text"
                  placeholder="Exercise name"
                  value={ex.name}
                  onChange={e => updateExercise(idx, 'name', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Sets"
                  value={ex.sets}
                  onChange={e => updateExercise(idx, 'sets', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Reps"
                  value={ex.reps}
                  onChange={e => updateExercise(idx, 'reps', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Weight"
                  value={ex.weight}
                  onChange={e => updateExercise(idx, 'weight', e.target.value)}
                />
                <button className="btn btn-danger btn-sm" onClick={() => removeExercise(idx)}>
                  ×
                </button>
              </div>
            ))}
            <button className="btn btn-secondary btn-sm" onClick={addExercise}>
              + Add Exercise
            </button>
          </div>

          <div className="rb-actions">
            <button className="btn btn-primary" onClick={handleSaveRoutine} disabled={loading}>
              {loading ? 'Saving...' : 'Save Routine'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // List mode
  return (
    <div className="routine-list">
      <div className="rl-header">
        <h3>My Routines</h3>
        <button className="btn btn-primary btn-sm" onClick={() => { setMode('create'); setEditingId(null) }}>
          + New Routine
        </button>
      </div>

      {loading ? (
        <p>Loading routines...</p>
      ) : routines.length === 0 ? (
        <p className="rl-empty">No routines yet. Create one to get started!</p>
      ) : (
        <div className="rl-items">
          {routines.map(routine => (
            <div key={routine._id} className="rl-item">
              <div className="rli-content">
                <h4>{routine.name}</h4>
                {routine.description && <p>{routine.description}</p>}
                <span className="rli-count">{routine.exercises.length} exercises</span>
              </div>
              <div className="rli-actions">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setFormData(routine)
                    setEditingId(routine._id)
                    setMode('edit')
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteRoutine(routine._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
