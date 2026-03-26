import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="logo">FitTrack</Link>
      <div className="nav-actions">
        <a href="#calculator" className="btn btn-outline nav-tool-btn">🔥 Free Calorie Tool</a>
        <Link to="/login" className="btn btn-ghost">Login</Link>
        <Link to="/signup" className="btn btn-primary">Sign Up →</Link>
      </div>
    </nav>
  )
}
