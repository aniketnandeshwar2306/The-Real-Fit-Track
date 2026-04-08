import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.username.trim()) return setError('Please enter username or email')
    if (!form.password) return setError('Please enter your password')

    try {
      setError('')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: form.username,
          password: form.password,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        return setError(data.message || 'Login failed')
      }

      // Store token and reload — this re-runs the context's useEffect
      localStorage.setItem('fittrack_token', data.token)
      window.location.href = '/dashboard'
    } catch (err) {
      setError('Could not connect to server. Is the backend running?')
      console.error('Login error:', err)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-header">
        <Link to="/" className="auth-logo">FitTrack</Link>
        <p className="auth-tagline">Welcome back. Let's get to work.</p>
      </div>
      <div className="auth-card animate-slide-up">
        <h2 className="auth-title">LOGIN</h2>
        <p className="auth-sub">Enter your credentials to continue</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Username / Email</label>
            <input type="text" placeholder="Enter username or email"
              value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <div className="pw-wrap">
              <input type={showPw ? 'text' : 'password'} placeholder="Enter your password"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div className="auth-options">
            <label className="remember"><input type="checkbox" /> Remember me</label>
            <a href="#" className="forgot">Forgot password?</a>
          </div>
          <button type="submit" className="btn btn-primary auth-submit">Login →</button>
        </form>
        <p className="auth-switch">Don't have an account? <Link to="/signup">Sign up free</Link></p>
      </div>
    </div>
  )
}
