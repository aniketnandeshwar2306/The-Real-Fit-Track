const features = [
  {
    title: 'Track Workouts',
    desc: 'Log every set, rep, and rest period. Choose from 500+ exercises or create your own custom routines.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
  },
  {
    title: 'Monitor Nutrition',
    desc: 'Track calories, macros, and meals with a massive food database. Hit your targets every single day.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    title: 'Visualize Progress',
    desc: 'Beautiful charts and insights that show exactly how far you\'ve come. Celebrate every milestone.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
  },
  {
    title: 'Join the Community',
    desc: 'Share workouts, challenge friends, and stay motivated with a supportive fitness community.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
]

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="section-label">Why FitTrack</div>
      <h2 className="section-title">EVERYTHING YOU NEED<br />TO STAY ON TRACK</h2>
      <p className="section-sub">Built for people who take their fitness seriously — whether you're just starting or pushing limits.</p>

      <div className="features-grid">
        {features.map((f, i) => (
          <div className="feature-card animate-slide-up" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
