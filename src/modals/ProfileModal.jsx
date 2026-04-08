import { useState } from 'react'
import { useFitTrack } from '../context/FitTrackContext'

export default function ProfileModal({ onClose }) {
  const { profile, updateProfile, tdee } = useFitTrack()
  const [form, setForm] = useState(profile || {
    name: '', age: '', weight: '', height: '', gender: 'male', activityLevel: 'moderate',
    waterGoal: 3000, calorieTarget: null, dailyWorkoutTarget: 1
  })

  function handleSubmit(e) {
    e.preventDefault()
    updateProfile({
      ...form,
      age: parseInt(form.age),
      weight: parseFloat(form.weight),
      height: parseFloat(form.height),
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget && profile) onClose() }}>
      <div className="modal-card">
        <h2 className="modal-title">{profile ? 'UPDATE PROFILE' : 'SET UP YOUR PROFILE'}</h2>
        <p className="modal-sub">{profile ? 'Update your details to recalculate targets.' : 'We need a few details to calculate your daily calorie target.'}</p>

        <form onSubmit={handleSubmit}>
          <div className="modal-row">
            <div className="modal-field">
              <label>Name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your name" required />
            </div>
            <div className="modal-field">
              <label>Age</label>
              <input type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} placeholder="25" min="10" max="100" required />
            </div>
          </div>
          <div className="modal-row">
            <div className="modal-field">
              <label>Weight (kg)</label>
              <input type="number" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} placeholder="70" min="30" max="300" step="0.1" required />
            </div>
            <div className="modal-field">
              <label>Height (cm)</label>
              <input type="number" value={form.height} onChange={e => setForm({...form, height: e.target.value})} placeholder="175" min="100" max="250" required />
            </div>
          </div>
          <div className="modal-field">
            <label>Gender</label>
            <div className="radio-group">
              <label className="radio-label">
                <input type="radio" checked={form.gender === 'male'} onChange={() => setForm({...form, gender: 'male'})} />
                <span className="radio-btn">Male</span>
              </label>
              <label className="radio-label">
                <input type="radio" checked={form.gender === 'female'} onChange={() => setForm({...form, gender: 'female'})} />
                <span className="radio-btn">Female</span>
              </label>
            </div>
          </div>
          <div className="modal-field">
            <label>Activity Level</label>
            <select value={form.activityLevel} onChange={e => setForm({...form, activityLevel: e.target.value})}>
              <option value="sedentary">Sedentary — Little or no exercise</option>
              <option value="light">Light — Exercise 1-3 days/week</option>
              <option value="moderate">Moderate — Exercise 3-5 days/week</option>
              <option value="active">Active — Hard exercise 6-7 days/week</option>
              <option value="veryActive">Very Active — Intense daily exercise</option>
            </select>
          </div>

          {/* Goal Settings Section */}
          <div className="modal-divider" style={{ margin: '20px 0', borderTop: '1px solid var(--border)' }} />
          <div style={{ marginBottom: '15px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 15px 0', fontWeight: '600', textTransform: 'uppercase' }}>
              📊 Goal Settings
            </p>
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label>Daily Water Goal (ml)</label>
              <input type="number" value={form.waterGoal} onChange={e => setForm({...form, waterGoal: parseFloat(e.target.value)})} placeholder="3000" min="500" max="10000" step="250" required />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>Recommended: 3000 ml/day</p>
            </div>
            <div className="modal-field">
              <label>Daily Workout Target</label>
              <input type="number" value={form.dailyWorkoutTarget} onChange={e => setForm({...form, dailyWorkoutTarget: parseFloat(e.target.value)})} placeholder="1" min="0" max="10" step="0.5" required />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>Workouts per day goal</p>
            </div>
          </div>

          <div className="modal-field">
            <label>Daily Calorie Target (kcal)</label>
            <input type="number" value={form.calorieTarget || ''} onChange={e => setForm({...form, calorieTarget: e.target.value ? parseFloat(e.target.value) : null})} placeholder={`Leave blank for auto-TDEE (${tdee} cal)`} min="800" max="10000" step="50" />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>Leave blank to auto-calculate from TDEE. Your TDEE: {tdee} cal</p>
          </div>
          <button type="submit" className="btn btn-primary modal-submit">
            {profile ? 'Update Profile' : 'Calculate My Calories'} →
          </button>
        </form>
      </div>
    </div>
  )
}
