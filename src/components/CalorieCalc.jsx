import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function CalorieCalc() {
  const [result, setResult] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    const fd = new FormData(e.target)
    const age = parseInt(fd.get('age'))
    const weight = parseFloat(fd.get('weight'))
    const height = parseFloat(fd.get('height'))
    const gender = fd.get('gender')
    const multiplier = parseFloat(fd.get('activity'))

    const bmr = gender === 'male'
      ? Math.round(10 * weight + 6.25 * height - 5 * age + 5)
      : Math.round(10 * weight + 6.25 * height - 5 * age - 161)
    const tdee = Math.round(bmr * multiplier)

    setResult({ bmr, tdee })

    setTimeout(() => {
      document.getElementById('calc-result')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  return (
    <section className="calc-section" id="calculator">
      <div className="calc-inner">
        <div className="section-label">Free Tool</div>
        <h2 className="section-title">CALORIE CALCULATOR</h2>
        <p className="section-sub">Find out how many calories you need daily — no sign-up required.</p>

        <div className="calc-card">
          <form onSubmit={handleSubmit}>
            <div className="calc-grid">
              <div className="calc-field">
                <label>Age</label>
                <input type="number" name="age" placeholder="25" min="10" max="100" required />
              </div>
              <div className="calc-field">
                <label>Weight (kg)</label>
                <input type="number" name="weight" placeholder="70" min="30" max="300" step="0.1" required />
              </div>
              <div className="calc-field">
                <label>Height (cm)</label>
                <input type="number" name="height" placeholder="175" min="100" max="250" required />
              </div>
              <div className="calc-field">
                <label>Gender</label>
                <div className="calc-radio-row">
                  <label className="calc-radio">
                    <input type="radio" name="gender" value="male" defaultChecked />
                    <span>Male</span>
                  </label>
                  <label className="calc-radio">
                    <input type="radio" name="gender" value="female" />
                    <span>Female</span>
                  </label>
                </div>
              </div>
              <div className="calc-field full-width">
                <label>Activity Level</label>
                <select name="activity" required>
                  <option value="1.2">Sedentary — Little or no exercise</option>
                  <option value="1.375">Light — Exercise 1-3 days/week</option>
                  <option value="1.55" defaultValue>Moderate — Exercise 3-5 days/week</option>
                  <option value="1.725">Active — Hard exercise 6-7 days/week</option>
                  <option value="1.9">Very Active — Intense daily exercise</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary calc-submit">Calculate My Calories →</button>
          </form>

          {result && (
            <div className="calc-result" id="calc-result">
              <div className="calc-result-grid">
                <div className="calc-result-block">
                  <div className="calc-result-number">{result.bmr} cal</div>
                  <div className="calc-result-label">BMR<br /><span>Basal Metabolic Rate</span></div>
                </div>
                <div className="calc-result-block highlight">
                  <div className="calc-result-number">{result.tdee} cal</div>
                  <div className="calc-result-label">TDEE<br /><span>Daily Calorie Need</span></div>
                </div>
              </div>

              <div className="goal-row">
                <div className="goal-card loss">
                  <div className="goal-title">🔥 Weight Loss</div>
                  <div className="goal-cal">{result.tdee - 500} cal/day</div>
                  <div className="goal-desc">500 cal deficit · ~0.5 kg/week</div>
                </div>
                <div className="goal-card maintain">
                  <div className="goal-title">⚖️ Maintain Weight</div>
                  <div className="goal-cal">{result.tdee} cal/day</div>
                  <div className="goal-desc">Keep your current weight</div>
                </div>
                <div className="goal-card gain">
                  <div className="goal-title">💪 Muscle Gain</div>
                  <div className="goal-cal">{result.tdee + 300} cal/day</div>
                  <div className="goal-desc">300 cal surplus · lean bulk</div>
                </div>
              </div>

              <div className="calc-nudge">
                <div className="nudge-icon">🔒</div>
                <div className="nudge-text">
                  <strong>Want personalized exercise recommendations, meal plans &amp; progress tracking?</strong>
                  <p>Sign up or log in to unlock workout routines tailored to your calorie goals, custom nutrition plans, and detailed analytics.</p>
                </div>
                <div className="nudge-actions">
                  <Link to="/signup" className="btn btn-primary">Sign Up Free →</Link>
                  <Link to="/login" className="btn btn-outline">Log In</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
