import { useState } from 'react'
import { useFitTrack } from '../context/FitTrackContext'

const FOODS = [
  { name: 'Chicken Breast (100g)', cal: 165 },
  { name: 'Rice (1 cup cooked)', cal: 206 },
  { name: 'Egg (1 large)', cal: 72 },
  { name: 'Banana (1 medium)', cal: 105 },
  { name: 'Milk (1 glass)', cal: 150 },
  { name: 'Roti / Chapati (1)', cal: 120 },
  { name: 'Dal (1 cup)', cal: 180 },
  { name: 'Paneer (100g)', cal: 265 },
  { name: 'Apple (1 medium)', cal: 95 },
  { name: 'Oats (1 cup cooked)', cal: 154 },
  { name: 'Protein Shake', cal: 200 },
  { name: 'Salad (mixed, 1 bowl)', cal: 80 },
]

export default function MealModal({ onClose }) {
  const { addMeal } = useFitTrack()
  const [name, setName] = useState('')
  const [cal, setCal] = useState('')

  function handleQuick(food) {
    addMeal(food.name, food.cal)
    onClose()
  }

  function handleSubmit(e) {
    e.preventDefault()
    const c = parseInt(cal)
    if (!c || c <= 0) return
    addMeal(name || 'Custom Meal', c)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <h2 className="modal-title">LOG A MEAL</h2>
        <p className="modal-sub">Pick a common food or enter custom calories.</p>

        <div className="quick-foods-grid">
          {FOODS.map((f, i) => (
            <button key={i} className="quick-food" onClick={() => handleQuick(f)}>
              <span className="qf-name">{f.name}</span>
              <span className="qf-cal">{f.cal} cal</span>
            </button>
          ))}
        </div>

        <div className="modal-divider"><span>or enter manually</span></div>

        <form onSubmit={handleSubmit}>
          <div className="modal-row">
            <div className="modal-field" style={{ flex: 2 }}>
              <label>Food Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Grilled chicken" />
            </div>
            <div className="modal-field" style={{ flex: 1 }}>
              <label>Calories</label>
              <input type="number" value={cal} onChange={e => setCal(e.target.value)} placeholder="250" min="1" max="5000" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary modal-submit">Add Meal →</button>
        </form>
      </div>
    </div>
  )
}
