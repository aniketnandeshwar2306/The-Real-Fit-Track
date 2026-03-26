import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  function getStrength(pw) {
    let s = 0
    if (pw.length >= 6) s++
    if (pw.length >= 10) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }

  const strength = getStrength(form.password)
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const strengthColors = ['', '#ff4444', '#ff8800', '#ffaa00', '#88cc00', '#AAFF00']

  function handleSubmit(e) {
    e.preventDefault()
    if (form.username.length < 3) return setError('Username must be at least 3 characters')
    if (!/\S+@\S+\.\S+/.test(form.email)) return setError('Please enter a valid email')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    setError('')
    navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-header">
        <Link to="/" className="auth-logo">FitTrack</Link>
        <p className="auth-tagline">Start your journey. It's completely free.</p>
      </div>
      <div className="auth-card animate-slide-up">
        <h2 className="auth-title">CREATE ACCOUNT</h2>
        <p className="auth-sub">Fill in the details below to get started</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Username</label>
            <input type="text" placeholder="Choose a username"
              value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
          </div>
          <div className="auth-field">
            <label>Email Address</label>
            <input type="email" placeholder="Enter your email"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="auth-field">
            <label>Create Password</label>
            <div className="pw-wrap">
              <input type={showPw ? 'text' : 'password'} placeholder="Create a strong password"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
            {form.password && (
              <div className="strength-bar">
                <div className="strength-track">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="strength-seg"
                      style={{ background: i <= strength ? strengthColors[strength] : 'var(--border)' }} />
                  ))}
                </div>
                <span className="strength-label" style={{ color: strengthColors[strength] }}>
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
          </div>
          <button type="submit" className="btn btn-primary auth-submit">Create Account →</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  )
}
