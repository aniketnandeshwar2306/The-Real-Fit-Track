import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-badge animate-slide-up">
        <span className="dot"></span>
        Now in Beta — Join Free
      </div>

      <h1 className="animate-slide-up delay-1">
        TRANSFORM YOUR<br />
        <span className="accent">FITNESS JOURNEY</span>
      </h1>

      <p className="hero-sub animate-slide-up delay-2">
        Track workouts, monitor nutrition, and crush your goals — all in one
        beautifully designed platform. No cost, no compromises.
      </p>

      <div className="hero-actions animate-slide-up delay-3">
        <Link to="/signup" className="btn btn-primary">Get Started Free →</Link>
        <a href="#calculator" className="btn btn-outline">🔥 Calculate Calories</a>
      </div>

      <div className="hero-stats animate-slide-up delay-4">
        <div className="hero-stat">
          <div className="number">10K+</div>
          <div className="label">Active Users</div>
        </div>
        <div className="hero-stat">
          <div className="number">500+</div>
          <div className="label">Exercises</div>
        </div>
        <div className="hero-stat">
          <div className="number">98%</div>
          <div className="label">Satisfaction</div>
        </div>
      </div>

      <div className="hero-divider"></div>
    </section>
  )
}
