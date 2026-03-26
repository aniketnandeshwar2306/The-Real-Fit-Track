import { useFitTrack } from '../context/FitTrackContext'
import { Link, useLocation } from 'react-router-dom'

export default function DashNav() {
  const { profile } = useFitTrack()
  const location = useLocation()
  const initials = profile ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'FT'
  const path = location.pathname

  return (
    <header className="dash-header">
      <div className="dash-header-top">
        <Link to="/" className="logo">FitTrack</Link>
        <div className="searchbar">
          <input type="text" placeholder="Search exercises, foods..." />
          <button className="btn btn-primary btn-sm">Search</button>
        </div>
        <div className="header-actions">
          <div className="notif-bell">
            🔔
            <span className="notif-badge">3</span>
          </div>
          <div className="avatar" id="profile-btn">{initials}</div>
        </div>
      </div>
      <nav className="dash-nav">
        <div className="nav-links">
          <Link to="/dashboard" className={`nav-link ${path === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
          <Link to="/workouts" className={`nav-link ${path === '/workouts' ? 'active' : ''}`}>Workouts</Link>
          <Link to="/nutrition" className={`nav-link ${path === '/nutrition' ? 'active' : ''}`}>Nutrition</Link>
          <Link to="#" className="nav-link">Progress</Link>
          <Link to="#" className="nav-link">Community</Link>
        </div>
        <div className="nav-quick">
          <Link to="/workouts" className="btn btn-outline btn-sm">Start Workout</Link>
          <Link to="/nutrition" className="btn btn-outline btn-sm">Log Meal</Link>
        </div>
      </nav>
    </header>
  )
}
