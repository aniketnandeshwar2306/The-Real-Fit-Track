import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer>
      <div className="footer-parent">
        <div className="top-row">
          <Link to="#" className="web-info">Terms &amp; Conditions</Link>
          <Link to="#" className="web-info">Privacy Policy</Link>
          <Link to="#" className="web-info">Contact Us</Link>
        </div>
        <div className="bottom-section">
          <div className="quote"><p>REMEMBER — HEALTH IS WEALTH.</p></div>
          <div className="goodbye"><p>Thanks for visiting FitTrack!</p></div>
        </div>
      </div>
    </footer>
  )
}
