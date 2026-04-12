import { useState } from 'react'
import { useFitTrack } from '../context/FitTrackContext'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function DashNav({ onProfileClick }) {
  const { profile, logout } = useFitTrack()
  const location = useLocation()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const name = profile?.name || 'User'
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
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
          <div className="avatar-wrap" style={{ position: 'relative' }}>
            <div className="avatar" id="profile-btn" onClick={() => setShowMenu(!showMenu)}>{initials}</div>
            {showMenu && (
              <div className="avatar-menu" style={{
                position: 'absolute', right: 0, top: '110%', background: '#1a1a2e',
                border: '1px solid rgba(170,255,0,0.2)', borderRadius: '8px',
                padding: '8px 0', minWidth: '150px', zIndex: 100,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
              }}>
                <div style={{ padding: '8px 16px', color: '#aaa', fontSize: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {name}
                </div>
                <button onClick={() => { onProfileClick?.(); setShowMenu(false); }} style={{
                  width: '100%', padding: '10px 16px', background: 'none', border: 'none',
                  color: '#AAFF00', cursor: 'pointer', textAlign: 'left', fontSize: '14px'
                }}>
                  👤 View Profile
                </button>
                <button onClick={() => { logout(); navigate('/login'); }} style={{
                  width: '100%', padding: '10px 16px', background: 'none', border: 'none',
                  color: '#ff4444', cursor: 'pointer', textAlign: 'left', fontSize: '14px'
                }}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <nav className="dash-nav">
        <div className="nav-links">
          <Link to="/dashboard" className={`nav-link ${path === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
          <Link to="/workouts" className={`nav-link ${path === '/workouts' ? 'active' : ''}`}>Workouts</Link>
          <Link to="/nutrition" className={`nav-link ${path === '/nutrition' ? 'active' : ''}`}>Nutrition</Link>
          <Link to="/progress" className={`nav-link ${path === '/progress' ? 'active' : ''}`}>Progress</Link>
          <Link to="/community" className={`nav-link ${path === '/community' ? 'active' : ''}`}>Community</Link>
        </div>
        <div className="nav-quick">
          <Link to="/workouts" className="btn btn-outline btn-sm">Start Workout</Link>
          <Link to="/nutrition" className="btn btn-outline btn-sm">Log Meal</Link>
        </div>
      </nav>
    </header>
  )
}
