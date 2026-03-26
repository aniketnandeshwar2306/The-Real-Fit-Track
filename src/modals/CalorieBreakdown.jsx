import { useFitTrack } from '../context/FitTrackContext'

export default function CalorieBreakdown({ onClose }) {
  const { profile, today, bmr, tdee, caloriesBurned } = useFitTrack()
  if (!profile) return null

  const consumed = today.caloriesConsumed
  const net = consumed - caloriesBurned
  const surplus = net > tdee

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <h2 className="modal-title">CALORIE BREAKDOWN</h2>
        <p className="modal-sub">Based on your profile ({profile.weight}kg, {profile.height}cm, {profile.age}y, {profile.activityLevel})</p>

        <div className="calorie-summary">
          <div className="cal-block">
            <div className="cal-number">{bmr}</div>
            <div className="cal-label">BMR</div>
          </div>
          <div className="cal-block highlight">
            <div className="cal-number">{tdee}</div>
            <div className="cal-label">Daily Target (TDEE)</div>
          </div>
          <div className="cal-block">
            <div className={`cal-number ${surplus ? 'red-text' : 'green-text'}`}>{net}</div>
            <div className="cal-label">Net Today</div>
          </div>
        </div>

        <div className="breakdown-section">
          <h4 className="breakdown-heading">🍽️ Meals Consumed — {consumed} cal</h4>
          {today.meals.length > 0 ? today.meals.map((m, i) => (
            <div className="breakdown-row" key={i}>
              <span>{m.name}</span>
              <span className="amber-text">+{m.calories} cal</span>
            </div>
          )) : <div className="breakdown-empty">No meals logged yet</div>}
        </div>

        <div className="breakdown-section">
          <h4 className="breakdown-heading">🔥 Calories Burned — {caloriesBurned} cal</h4>
          {today.workouts.filter(w => w.done).length > 0 ? today.workouts.filter(w => w.done).map((w, i) => (
            <div className="breakdown-row" key={i}>
              <span>{w.name}</span>
              <span className="green-text">-{w.calories} cal</span>
            </div>
          )) : <div className="breakdown-empty">No workouts completed yet</div>}
        </div>

        <div className={`calorie-verdict ${surplus ? 'over' : 'under'}`}>
          {surplus
            ? `⚠️ You're ${net - tdee} cal OVER your daily target`
            : `✅ You have ${tdee - net} cal remaining today`}
        </div>

        <button className="btn btn-outline modal-close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
