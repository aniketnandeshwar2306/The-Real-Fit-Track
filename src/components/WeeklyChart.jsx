const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HEIGHTS = [25, 70, 35, 45, 55, 80, 60]

export default function WeeklyChart() {
  const todayJS = new Date().getDay()
  const dayMap = [6, 0, 1, 2, 3, 4, 5]
  const activeIndex = dayMap[todayJS]

  return (
    <div className="chart-card animate-slide-up delay-2">
      <div className="card-header">
        <h3 className="card-title">Weekly Activity</h3>
        <span className="badge">This Week</span>
      </div>
      <div className="chart-container">
        {DAYS.map((day, i) => (
          <div className={`chart-bar ${i === activeIndex ? 'active' : ''}`} key={day} data-day={day}>
            <div className="bar-fill" style={{ height: `${HEIGHTS[i]}%` }}></div>
          </div>
        ))}
      </div>
    </div>
  )
}
