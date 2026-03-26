export default function QuickActions({ onWorkout, onMeal, onWater, onStats }) {
  return (
    <div className="quick-actions-card animate-slide-up delay-4">
      <h3 className="card-title">Quick Actions</h3>
      <div className="actions-grid">
        <button className="action-btn" onClick={onWorkout}>
          <span className="action-icon">🏋️</span><span>Log Workout</span>
        </button>
        <button className="action-btn" onClick={onMeal}>
          <span className="action-icon">🥗</span><span>Log Meal</span>
        </button>
        <button className="action-btn" onClick={onWater}>
          <span className="action-icon">💧</span><span>Log Water</span>
        </button>
        <button className="action-btn" onClick={onStats}>
          <span className="action-icon">📊</span><span>View Stats</span>
        </button>
      </div>
    </div>
  )
}
