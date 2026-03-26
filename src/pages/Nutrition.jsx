import { useState } from 'react'
import { useFitTrack } from '../context/FitTrackContext'
import DashNav from '../components/DashNav'
import Footer from '../components/Footer'
import './Nutrition.css'

const FOOD_DB = [
  { name: 'Chicken Breast (100g)', cal: 165, protein: 31, carbs: 0, fat: 3.6, category: 'protein' },
  { name: 'Egg (1 large)', cal: 72, protein: 6, carbs: 0.6, fat: 5, category: 'protein' },
  { name: 'Paneer (100g)', cal: 265, protein: 18, carbs: 1.2, fat: 21, category: 'protein' },
  { name: 'Dal / Lentils (1 cup)', cal: 180, protein: 12, carbs: 30, fat: 1, category: 'protein' },
  { name: 'Whey Protein (1 scoop)', cal: 120, protein: 24, carbs: 3, fat: 1, category: 'protein' },
  { name: 'Rice (1 cup cooked)', cal: 206, protein: 4.3, carbs: 45, fat: 0.4, category: 'carbs' },
  { name: 'Roti / Chapati (1)', cal: 120, protein: 3, carbs: 20, fat: 3.5, category: 'carbs' },
  { name: 'Oats (1 cup cooked)', cal: 154, protein: 5.3, carbs: 27, fat: 2.6, category: 'carbs' },
  { name: 'Sweet Potato (1 medium)', cal: 103, protein: 2, carbs: 24, fat: 0.1, category: 'carbs' },
  { name: 'Bread (1 slice)', cal: 79, protein: 3, carbs: 14, fat: 1, category: 'carbs' },
  { name: 'Banana (1 medium)', cal: 105, protein: 1.3, carbs: 27, fat: 0.3, category: 'fruits' },
  { name: 'Apple (1 medium)', cal: 95, protein: 0.5, carbs: 25, fat: 0.3, category: 'fruits' },
  { name: 'Mango (1 cup)', cal: 99, protein: 1.4, carbs: 25, fat: 0.6, category: 'fruits' },
  { name: 'Mixed Salad (1 bowl)', cal: 80, protein: 2, carbs: 12, fat: 2, category: 'fruits' },
  { name: 'Milk (1 glass)', cal: 150, protein: 8, carbs: 12, fat: 8, category: 'dairy' },
  { name: 'Curd / Yogurt (1 cup)', cal: 100, protein: 9, carbs: 7, fat: 3.5, category: 'dairy' },
  { name: 'Cheese (1 slice)', cal: 113, protein: 7, carbs: 0.4, fat: 9, category: 'dairy' },
  { name: 'Ghee (1 tbsp)', cal: 120, protein: 0, carbs: 0, fat: 14, category: 'fats' },
  { name: 'Peanut Butter (1 tbsp)', cal: 94, protein: 4, carbs: 3, fat: 8, category: 'fats' },
  { name: 'Almonds (10 pcs)', cal: 70, protein: 2.5, carbs: 2.5, fat: 6, category: 'fats' },
]

const CATEGORIES = [
  { key: 'all', label: 'All Foods', icon: '🍽️' },
  { key: 'protein', label: 'Protein', icon: '🍗' },
  { key: 'carbs', label: 'Carbs', icon: '🍚' },
  { key: 'fruits', label: 'Fruits & Veg', icon: '🥗' },
  { key: 'dairy', label: 'Dairy', icon: '🥛' },
  { key: 'fats', label: 'Fats', icon: '🥜' },
]

export default function Nutrition() {
  const { today, addMeal, tdee } = useFitTrack()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  const filtered = FOOD_DB.filter(f => {
    const matchCat = filter === 'all' || f.category === filter
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  function handleAdd(food) {
    addMeal(food.name, food.cal)
    setToast(`Added ${food.name} (+${food.cal} cal)`)
    setTimeout(() => setToast(''), 2500)
  }

  // Today's summary
  const consumed = today.caloriesConsumed
  const remaining = Math.max(0, tdee - consumed)
  const pct = tdee > 0 ? Math.min(100, Math.round((consumed / tdee) * 100)) : 0

  // Macro totals from meals
  const macros = today.meals.reduce((acc, m) => {
    const found = FOOD_DB.find(f => f.name === m.name)
    if (found) { acc.protein += found.protein; acc.carbs += found.carbs; acc.fat += found.fat }
    return acc
  }, { protein: 0, carbs: 0, fat: 0 })

  return (
    <div className="dashboard">
      <DashNav />
      <main className="dash-main">
        <h1 className="page-title animate-slide-up">NUTRITION</h1>
        <p className="page-sub animate-slide-up delay-1">Track your meals, monitor macros, and hit your daily calorie goals.</p>

        {/* Summary Bar */}
        <div className="nutri-summary animate-slide-up delay-2">
          <div className="ns-block">
            <div className="ns-label">Consumed</div>
            <div className="ns-value amber-text">{consumed}</div>
            <div className="ns-unit">cal</div>
          </div>
          <div className="ns-divider"></div>
          <div className="ns-block">
            <div className="ns-label">Target TDEE</div>
            <div className="ns-value">{tdee}</div>
            <div className="ns-unit">cal</div>
          </div>
          <div className="ns-divider"></div>
          <div className="ns-block">
            <div className="ns-label">Remaining</div>
            <div className="ns-value green-text">{remaining}</div>
            <div className="ns-unit">cal</div>
          </div>
          <div className="ns-progress-wrap">
            <div className="ns-progress-bar">
              <div className="ns-progress-fill" style={{ width: `${pct}%`, background: pct > 100 ? 'var(--red)' : 'var(--green)' }}></div>
            </div>
            <span className="ns-pct">{pct}%</span>
          </div>
        </div>

        {/* Macros */}
        <div className="macro-cards animate-slide-up delay-3">
          <div className="macro-card protein">
            <span className="mc-icon">🍗</span>
            <span className="mc-value">{Math.round(macros.protein)}g</span>
            <span className="mc-label">Protein</span>
          </div>
          <div className="macro-card carbs">
            <span className="mc-icon">🍚</span>
            <span className="mc-value">{Math.round(macros.carbs)}g</span>
            <span className="mc-label">Carbs</span>
          </div>
          <div className="macro-card fat">
            <span className="mc-icon">🥜</span>
            <span className="mc-value">{Math.round(macros.fat)}g</span>
            <span className="mc-label">Fat</span>
          </div>
        </div>

        <div className="nutri-layout">
          {/* Food Browser */}
          <section className="wo-section animate-slide-up delay-3">
            <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 18, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 16 }}>
              🍽️ Food Database
            </h2>

            <input type="text" className="nutri-search" placeholder="Search foods..."
              value={search} onChange={e => setSearch(e.target.value)} />

            <div className="cat-tabs">
              {CATEGORIES.map(c => (
                <button key={c.key} className={`cat-tab ${filter === c.key ? 'active' : ''}`}
                  onClick={() => setFilter(c.key)}>
                  <span>{c.icon}</span> {c.label}
                </button>
              ))}
            </div>

            <div className="food-list">
              {filtered.map((f, i) => (
                <div className="food-item" key={i}>
                  <div className="fi-info">
                    <div className="fi-name">{f.name}</div>
                    <div className="fi-macros">P: {f.protein}g · C: {f.carbs}g · F: {f.fat}g</div>
                  </div>
                  <div className="fi-cal">{f.cal} cal</div>
                  <button className="fi-add" onClick={() => handleAdd(f)}>+</button>
                </div>
              ))}
              {filtered.length === 0 && <div className="fi-empty">No foods match your search.</div>}
            </div>
          </section>

          {/* Today's Meals Log */}
          <section className="wo-section animate-slide-up delay-4">
            <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 18, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 16 }}>
              📋 Today's Meals ({today.meals.length})
            </h2>
            {today.meals.length === 0 ? (
              <div className="meals-empty">No meals logged yet. Add food from the database!</div>
            ) : (
              <div className="meals-log">
                {today.meals.map((m, i) => (
                  <div className="meal-item" key={i}>
                    <div className="mi-info">
                      <span className="mi-name">{m.name}</span>
                      <span className="mi-time">{m.time}</span>
                    </div>
                    <span className="mi-cal">+{m.calories} cal</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
