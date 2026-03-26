import { useFitTrack } from '../context/FitTrackContext'

export default function WorkoutList() {
  const { today, toggleWorkout } = useFitTrack()

  return (
    <div className="workout-card animate-slide-up delay-3">
      <div className="card-header">
        <h3 className="card-title">Today's Plan</h3>
        <span className="badge">Push Day</span>
      </div>
      <ul className="workout-list">
        {today.workouts.map((w, i) => (
          <li key={i} className={`workout-item ${w.done ? 'done' : ''}`}
              onClick={() => toggleWorkout(i)} style={{ cursor: 'pointer' }}>
            <div className="workout-check">{w.done ? '✓' : ''}</div>
            <div className="workout-details">
              <div className="workout-name">{w.name}</div>
              <div className="workout-sets">{w.sets} · {w.weight} · {w.calories} cal</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
