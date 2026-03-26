export default function StatCard({ label, value, change, changeClass, progress, ringColor, icon, onClick }) {
  const circumference = 2 * Math.PI * 16
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="stat-card animate-slide-up" onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>
      <div className={`stat-icon ${icon}`}>
        {icon === 'fire' && (
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 22c4.97 0 7-3.58 7-7 0-3.07-2-6.64-4-9l-1.5 2.5L11 4C8.5 7.5 5 11 5 15c0 3.42 2.03 7 7 7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
        {icon === 'workout' && (
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.8"/><path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.8"/></svg>
        )}
        {icon === 'water' && (
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" stroke="currentColor" strokeWidth="1.8"/></svg>
        )}
        {icon === 'goal' && (
          <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>
        )}
      </div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value" dangerouslySetInnerHTML={{ __html: value }} />
        <div className={`stat-change ${changeClass || 'positive'}`}>{change}</div>
      </div>
      <div className="stat-ring">
        <svg viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <circle cx="20" cy="20" r="16" fill="none" stroke={ringColor} strokeWidth="3"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 20 20)"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        </svg>
        <span>{progress}%</span>
      </div>
    </div>
  )
}
