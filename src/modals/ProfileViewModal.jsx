import { useFitTrack } from '../context/FitTrackContext'
import './ProfileViewModal.css'

export default function ProfileViewModal({ onClose, onEdit }) {
  const { profile, bmr, tdee } = useFitTrack()

  if (!profile) return null

  const activityLabels = {
    sedentary: 'Sedentary (Little/no exercise)',
    light: 'Light (1-3 days/week)',
    moderate: 'Moderate (3-5 days/week)',
    active: 'Active (6-7 days/week)',
    veryActive: 'Very Active (Intense daily)',
  }

  const goalLabels = {
    lose: '💪 Lose Weight',
    maintain: '⚖️ Maintain',
    gain: '🏋️ Gain Weight',
  }

  const getCalorieTarget = () => {
    switch(profile.goal) {
      case 'lose': return Math.round(tdee - 500)
      case 'gain': return Math.round(tdee + 500)
      case 'maintain':
      default: return tdee
    }
  }

  const getGoalDescription = () => {
    switch(profile.goal) {
      case 'lose': return '500 cal deficit for ~0.5 kg/week loss'
      case 'gain': return '500 cal surplus for ~0.5 kg/week gain'
      case 'maintain':
      default: return 'Maintenance calories'
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-card">
        <h2 className="modal-title">👤 YOUR PROFILE</h2>
        <p className="modal-sub">View and manage your fitness profile details</p>

        <div className="profile-view-grid">
          <div className="pv-item">
            <span className="pv-label">Age</span>
            <span className="pv-value">{profile.age} years</span>
          </div>
          <div className="pv-item">
            <span className="pv-label">Height</span>
            <span className="pv-value">{profile.height} cm</span>
          </div>
          <div className="pv-item">
            <span className="pv-label">Weight</span>
            <span className="pv-value">{profile.weight} kg</span>
          </div>
          <div className="pv-item">
            <span className="pv-label">Gender</span>
            <span className="pv-value">{profile.gender === 'male' ? '♂ Male' : '♀ Female'}</span>
          </div>
        </div>

        <div className="profile-view-section">
          <span className="pv-label">Activity Level</span>
          <span className="pv-value">{activityLabels[profile.activityLevel]}</span>
        </div>

        <div className="profile-view-section">
          <span className="pv-label">Your Goal</span>
          <span className="pv-value">{goalLabels[profile.goal] || '⚖️ Maintain'}</span>
        </div>

        <div className="profile-view-metrics">
          <div className="pvm-item">
            <span className="pvm-label">BMR</span>
            <span className="pvm-value">{bmr}</span>
            <span className="pvm-unit">cal/day</span>
          </div>
          <div className="pvm-item">
            <span className="pvm-label">TDEE</span>
            <span className="pvm-value">{tdee}</span>
            <span className="pvm-unit">cal/day</span>
          </div>
        </div>

        <div className="profile-view-goals">
          <h4>Goal Settings</h4>
          <div className="pvg-grid">
            <div className="pvg-item">
              <span className="pvg-label">Recommended Daily Calories</span>
              <span className="pvg-value">{getCalorieTarget()}</span>
              <span style={{ fontSize: '9px', color: 'var(--text-dim)', marginTop: '2px', display: 'block' }}>{getGoalDescription()}</span>
            </div>
            <div className="pvg-item">
              <span className="pvg-label">Water Goal</span>
              <span className="pvg-value">{profile.waterGoal} ml</span>
            </div>
            <div className="pvg-item">
              <span className="pvg-label">Workout Target</span>
              <span className="pvg-value">{profile.dailyWorkoutTarget}</span>
              <span style={{ fontSize: '9px', color: 'var(--text-dim)', marginTop: '2px', display: 'block' }}>workouts/day</span>
            </div>
          </div>
        </div>

        <button type="button" className="btn btn-primary modal-submit" onClick={onEdit}>
          ✏️ Edit Profile →
        </button>
      </div>
    </div>
  )
}
