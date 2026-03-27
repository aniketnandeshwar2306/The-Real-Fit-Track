import { useState } from 'react'
import { useFitTrack } from '../context/FitTrackContext'

function buildActivities(dayData, label) {
  if (!dayData) return []
  const acts = []
  dayData.workouts.forEach(w => {
    if (w.done) acts.push({ name: w.name, meta: `${w.sets} · ${w.calories} cal burned`, dot: 'green', type: 'workout', day: label })
  })
  dayData.meals.forEach(m => {
    acts.push({ name: m.name, meta: `${m.calories} cal · ${m.time}`, dot: 'amber', type: 'meal', day: label })
  })
  if ((dayData.sports || []).length > 0) {
    dayData.sports.forEach(s => {
      acts.push({ name: `${s.icon} ${s.name}`, meta: `${s.duration} min · ${s.calories} cal burned`, dot: 'green', type: 'sport', day: label })
    })
  }
  if (dayData.waterMl > 0) {
    acts.push({ name: 'Water Intake', meta: `${dayData.waterMl}ml logged`, dot: 'blue', type: 'water', day: label })
  }
  return acts
}

export default function ActivityFeed() {
  const { today, yesterday } = useFitTrack()
  const [showAll, setShowAll] = useState(false)

  const todayActs = buildActivities(today, 'Today')
  const yesterdayActs = buildActivities(yesterday, 'Yesterday')
  const allActivities = [...todayActs, ...yesterdayActs]
  const displayList = showAll ? allActivities : todayActs.slice(0, 4)

  return (
    <div className="activity-card animate-slide-up delay-5">
      <div className="card-header">
        <h3 className="card-title">Recent Activity</h3>
        <button className="card-link" onClick={() => setShowAll(!showAll)} style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}>
          {showAll ? '← Show Less' : 'View All →'}
        </button>
      </div>
      <div className="activity-list">
        {displayList.length === 0 ? (
          <div className="activity-empty">No activity yet today. Start a workout or log a meal!</div>
        ) : (
          <>
            {displayList.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className={`activity-dot ${a.dot}`}></div>
                <div className="activity-info">
                  <div className="activity-name">{a.name}</div>
                  <div className="activity-meta">{a.meta}</div>
                </div>
                <div className="activity-time">
                  {showAll && a.day !== 'Today' ? <span className="activity-day-tag">{a.day}</span> : null}
                  {a.type}
                </div>
              </div>
            ))}
            {showAll && yesterdayActs.length === 0 && (
              <div className="activity-empty" style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 12 }}>
                No activity logged yesterday.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
