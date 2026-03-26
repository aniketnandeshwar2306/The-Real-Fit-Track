import { useState } from 'react'
import { useFitTrack } from '../context/FitTrackContext'

export default function WaterModal({ onClose }) {
  const { today, addWater } = useFitTrack()
  const [custom, setCustom] = useState('')

  function handleQuick(ml) {
    addWater(ml)
    onClose()
  }

  function handleCustom() {
    const ml = parseInt(custom)
    if (ml > 0) { addWater(ml); onClose() }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card modal-sm">
        <h2 className="modal-title">LOG WATER</h2>
        <p className="modal-sub">Current: {today.waterMl}ml / 3000ml</p>

        <div className="water-progress-bar">
          <div className="water-progress-fill" style={{ width: `${Math.min(100, (today.waterMl / 3000) * 100)}%` }}></div>
        </div>

        <div className="water-buttons">
          {[{ label: '🥤 150ml', ml: 150 }, { label: '💧 250ml', ml: 250 }, { label: '🧴 500ml', ml: 500 },
            { label: '🫗 750ml', ml: 750 }, { label: '🍶 1 Litre', ml: 1000 }].map(b => (
            <button key={b.ml} className="water-btn" onClick={() => handleQuick(b.ml)}>{b.label}</button>
          ))}
        </div>

        <div className="modal-field" style={{ marginTop: 16 }}>
          <label>Custom amount (ml)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="number" value={custom} onChange={e => setCustom(e.target.value)} placeholder="350" min="1" max="3000" style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={handleCustom} style={{ padding: '10px 20px' }}>Add</button>
          </div>
        </div>
      </div>
    </div>
  )
}
