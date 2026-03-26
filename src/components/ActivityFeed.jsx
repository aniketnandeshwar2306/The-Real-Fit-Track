import { useFitTrack } from '../context/FitTrackContext'

export default function ActivityFeed() {
  const { today } = useFitTrack()
  const activities = []

  today.workouts.forEach(w => {
    if (w.done) activities.push({ name: w.name, meta: `${w.sets} · ${w.calories} cal burned`, dot: 'green', type: 'workout' })
  })
  today.meals.forEach(m => {
    activities.push({ name: m.name, meta: `${m.calories} cal · ${m.time}`, dot: 'amber', type: 'meal' })
  })
  if (today.waterMl > 0) {
    activities.push({ name: 'Water Intake', meta: `${today.waterMl}ml logged today`, dot: 'blue', type: 'water' })
  }

  return (
    <div className="activity-card animate-slide-up delay-5">
      <div className="card-header">
        <h3 className="card-title">Recent Activity</h3>
        <a href="#" className="card-link">View All →</a>
      </div>
      <div className="activity-list">
        {activities.length === 0 ? (
          <div className="activity-empty">No activity yet today. Start a workout or log a meal!</div>
        ) : (
          activities.map((a, i) => (
            <div className="activity-item" key={i}>
              <div className={`activity-dot ${a.dot}`}></div>
              <div className="activity-info">
                <div className="activity-name">{a.name}</div>
                <div className="activity-meta">{a.meta}</div>
              </div>
              <div className="activity-time">{a.type}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
