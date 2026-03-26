export default function HowItWorks() {
  return (
    <section className="steps">
      <div className="section-label">How It Works</div>
      <h2 className="section-title">THREE SIMPLE STEPS</h2>
      <p className="section-sub" style={{ margin: '0 auto 0' }}>Get started in under a minute. No credit card required.</p>

      <div className="steps-grid">
        <div className="step-card">
          <div className="step-number">1</div>
          <h3>Create Your Account</h3>
          <p>Sign up for free in seconds. Just a username, email, and password.</p>
        </div>
        <div className="step-connector">→</div>
        <div className="step-card">
          <div className="step-number">2</div>
          <h3>Set Your Goals</h3>
          <p>Tell us your targets — weight loss, muscle gain, or general fitness.</p>
        </div>
        <div className="step-connector">→</div>
        <div className="step-card">
          <div className="step-number">3</div>
          <h3>Track &amp; Crush It</h3>
          <p>Log workouts, meals, and water. Watch your progress unfold in real time.</p>
        </div>
      </div>
    </section>
  )
}
