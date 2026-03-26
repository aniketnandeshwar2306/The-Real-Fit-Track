import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import CalorieCalc from '../components/CalorieCalc'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import './Landing.css'

export default function Landing() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CalorieCalc />

      {/* CTA */}
      <section className="cta">
        <h2>READY TO<br /><span style={{ color: 'var(--green)' }}>START?</span></h2>
        <p>Join thousands of users who are transforming their fitness journey with FitTrack.</p>
        <Link to="/signup" className="btn btn-primary">Join FitTrack Free →</Link>
      </section>

      <Footer />
    </>
  )
}
