import { useState } from 'react'
import { useFitTrack } from '../context/FitTrackContext'

// Pre-built workout plans
const RECOMMENDED_PLANS = {
  weight_loss: {
    name: '🔥 Fat Burn Program',
    goal: 'Weight Loss',
    split: '5 days/week',
    days: [
      { day: 'Monday', title: 'Full Body HIIT', exercises: [
        { name: 'Jumping Jacks', sets: '3', reps: '30 sec', cal: 50 },
        { name: 'Burpees', sets: '3', reps: '12', cal: 60 },
        { name: 'Mountain Climbers', sets: '3', reps: '20', cal: 45 },
        { name: 'Squat Jumps', sets: '3', reps: '15', cal: 55 },
        { name: 'Plank', sets: '3', reps: '45 sec', cal: 30 },
      ]},
      { day: 'Tuesday', title: 'Cardio + Core', exercises: [
        { name: 'Running (Treadmill)', sets: '1', reps: '20 min', cal: 200 },
        { name: 'Bicycle Crunches', sets: '3', reps: '20', cal: 35 },
        { name: 'Leg Raises', sets: '3', reps: '15', cal: 30 },
        { name: 'Russian Twists', sets: '3', reps: '20', cal: 35 },
        { name: 'Dead Bug', sets: '3', reps: '12', cal: 25 },
      ]},
      { day: 'Wednesday', title: 'Upper Body Circuit', exercises: [
        { name: 'Push-Ups', sets: '3', reps: '15', cal: 40 },
        { name: 'Dumbbell Rows', sets: '3', reps: '12', cal: 45 },
        { name: 'Shoulder Press', sets: '3', reps: '12', cal: 45 },
        { name: 'Tricep Dips', sets: '3', reps: '15', cal: 35 },
        { name: 'Bicep Curls', sets: '3', reps: '12', cal: 30 },
      ]},
      { day: 'Thursday', title: 'Lower Body + Cardio', exercises: [
        { name: 'Squats', sets: '4', reps: '15', cal: 60 },
        { name: 'Lunges', sets: '3', reps: '12 each', cal: 50 },
        { name: 'Glute Bridges', sets: '3', reps: '15', cal: 35 },
        { name: 'Calf Raises', sets: '3', reps: '20', cal: 25 },
        { name: 'Cycling', sets: '1', reps: '15 min', cal: 150 },
      ]},
      { day: 'Friday', title: 'Total Body Burn', exercises: [
        { name: 'Kettlebell Swings', sets: '3', reps: '15', cal: 55 },
        { name: 'Box Jumps', sets: '3', reps: '12', cal: 50 },
        { name: 'Battle Ropes', sets: '3', reps: '30 sec', cal: 60 },
        { name: 'Plank Variations', sets: '3', reps: '30 sec each', cal: 40 },
        { name: 'Stretching', sets: '1', reps: '10 min', cal: 20 },
      ]},
    ]
  },
  muscle_gain: {
    name: '💪 Muscle Builder (PPL)',
    goal: 'Muscle Gain',
    split: '6 days/week · Push/Pull/Legs',
    days: [
      { day: 'Monday', title: 'Push (Chest/Shoulders/Triceps)', exercises: [
        { name: 'Bench Press', sets: '4', reps: '8-10', cal: 120 },
        { name: 'Incline Dumbbell Press', sets: '3', reps: '10-12', cal: 90 },
        { name: 'Overhead Press', sets: '3', reps: '10', cal: 85 },
        { name: 'Lateral Raises', sets: '4', reps: '15', cal: 55 },
        { name: 'Tricep Pushdown', sets: '3', reps: '12', cal: 45 },
        { name: 'Skull Crushers', sets: '3', reps: '12', cal: 45 },
      ]},
      { day: 'Tuesday', title: 'Pull (Back/Biceps)', exercises: [
        { name: 'Deadlift', sets: '4', reps: '6-8', cal: 150 },
        { name: 'Pull-Ups', sets: '3', reps: '8-10', cal: 80 },
        { name: 'Barbell Rows', sets: '3', reps: '10', cal: 90 },
        { name: 'Face Pulls', sets: '3', reps: '15', cal: 40 },
        { name: 'Barbell Curls', sets: '3', reps: '12', cal: 40 },
        { name: 'Hammer Curls', sets: '3', reps: '12', cal: 35 },
      ]},
      { day: 'Wednesday', title: 'Legs', exercises: [
        { name: 'Squat', sets: '4', reps: '8-10', cal: 140 },
        { name: 'Leg Press', sets: '3', reps: '12', cal: 100 },
        { name: 'Romanian Deadlift', sets: '3', reps: '10', cal: 90 },
        { name: 'Leg Curl', sets: '3', reps: '12', cal: 50 },
        { name: 'Leg Extension', sets: '3', reps: '12', cal: 50 },
        { name: 'Calf Raises', sets: '4', reps: '15', cal: 40 },
      ]},
      { day: 'Thursday', title: 'Push (Volume)', exercises: [
        { name: 'Dumbbell Bench Press', sets: '4', reps: '10-12', cal: 100 },
        { name: 'Cable Flyes', sets: '3', reps: '12', cal: 55 },
        { name: 'Arnold Press', sets: '3', reps: '10', cal: 75 },
        { name: 'Front Raises', sets: '3', reps: '12', cal: 40 },
        { name: 'Dips', sets: '3', reps: '12', cal: 70 },
        { name: 'Overhead Tricep Extension', sets: '3', reps: '12', cal: 40 },
      ]},
      { day: 'Friday', title: 'Pull (Volume)', exercises: [
        { name: 'T-Bar Rows', sets: '4', reps: '10', cal: 90 },
        { name: 'Lat Pulldown', sets: '3', reps: '12', cal: 70 },
        { name: 'Seated Cable Rows', sets: '3', reps: '12', cal: 65 },
        { name: 'Rear Delt Flyes', sets: '3', reps: '15', cal: 35 },
        { name: 'Preacher Curls', sets: '3', reps: '12', cal: 35 },
        { name: 'Concentration Curls', sets: '3', reps: '10', cal: 30 },
      ]},
      { day: 'Saturday', title: 'Legs (Volume)', exercises: [
        { name: 'Front Squats', sets: '4', reps: '10', cal: 120 },
        { name: 'Bulgarian Split Squats', sets: '3', reps: '10 each', cal: 80 },
        { name: 'Leg Press', sets: '3', reps: '15', cal: 90 },
        { name: 'Hip Thrusts', sets: '3', reps: '12', cal: 70 },
        { name: 'Leg Curl', sets: '3', reps: '12', cal: 50 },
        { name: 'Calf Raises (Seated)', sets: '4', reps: '20', cal: 35 },
      ]},
    ]
  },
  general_fitness: {
    name: '⚡ General Fitness',
    goal: 'Stay Fit & Active',
    split: '4 days/week · Full Body',
    days: [
      { day: 'Monday', title: 'Strength + Cardio Mix', exercises: [
        { name: 'Squats', sets: '3', reps: '12', cal: 60 },
        { name: 'Push-Ups', sets: '3', reps: '15', cal: 40 },
        { name: 'Dumbbell Rows', sets: '3', reps: '12', cal: 45 },
        { name: 'Plank', sets: '3', reps: '40 sec', cal: 25 },
        { name: 'Jump Rope', sets: '3', reps: '2 min', cal: 80 },
      ]},
      { day: 'Tuesday', title: 'Active Recovery / Yoga', exercises: [
        { name: 'Yoga Flow', sets: '1', reps: '30 min', cal: 100 },
        { name: 'Foam Rolling', sets: '1', reps: '15 min', cal: 30 },
        { name: 'Light Walking', sets: '1', reps: '20 min', cal: 60 },
      ]},
      { day: 'Thursday', title: 'Upper Body Focus', exercises: [
        { name: 'Bench Press', sets: '3', reps: '10', cal: 80 },
        { name: 'Pull-Ups / Lat Pulldown', sets: '3', reps: '10', cal: 70 },
        { name: 'Shoulder Press', sets: '3', reps: '10', cal: 60 },
        { name: 'Bicep Curls', sets: '3', reps: '12', cal: 35 },
        { name: 'Tricep Dips', sets: '3', reps: '12', cal: 35 },
      ]},
      { day: 'Friday', title: 'Lower Body + Core', exercises: [
        { name: 'Deadlift', sets: '3', reps: '10', cal: 100 },
        { name: 'Lunges', sets: '3', reps: '12 each', cal: 55 },
        { name: 'Glute Bridges', sets: '3', reps: '15', cal: 35 },
        { name: 'Hanging Leg Raises', sets: '3', reps: '12', cal: 40 },
        { name: 'Stretching', sets: '1', reps: '10 min', cal: 20 },
      ]},
    ]
  },
}

export default function GymPlan() {
  const { profile, today } = useFitTrack()
  const [mode, setMode] = useState(null) // null | 'own' | 'recommended'
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [expandedDay, setExpandedDay] = useState(null)

  // Custom plan builder
  const [customDays, setCustomDays] = useState([
    { day: 'Monday', title: '', exercises: [{ name: '', sets: '', reps: '', cal: '' }] }
  ])

  function addExercise(dayIndex) {
    setCustomDays(prev => prev.map((d, i) =>
      i === dayIndex ? { ...d, exercises: [...d.exercises, { name: '', sets: '', reps: '', cal: '' }] } : d
    ))
  }

  function removeExercise(dayIndex, exIndex) {
    setCustomDays(prev => prev.map((d, i) =>
      i === dayIndex ? { ...d, exercises: d.exercises.filter((_, j) => j !== exIndex) } : d
    ))
  }

  function updateExercise(dayIndex, exIndex, field, value) {
    setCustomDays(prev => prev.map((d, i) =>
      i === dayIndex ? {
        ...d,
        exercises: d.exercises.map((ex, j) => j === exIndex ? { ...ex, [field]: value } : ex)
      } : d
    ))
  }

  function updateDayTitle(dayIndex, title) {
    setCustomDays(prev => prev.map((d, i) => i === dayIndex ? { ...d, title } : d))
  }

  function addDay() {
    const dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
    const next = dayNames[customDays.length] || `Day ${customDays.length + 1}`
    setCustomDays(prev => [...prev, { day: next, title: '', exercises: [{ name: '', sets: '', reps: '', cal: '' }] }])
  }

  function removeDay(i) {
    setCustomDays(prev => prev.filter((_, idx) => idx !== i))
  }

  if (!mode) {
    return (
      <div className="gym-plan-section">
        <div className="gp-header">
          <span className="gp-icon">🏋️</span>
          <h2>Gym Workout Plan</h2>
        </div>
        <p className="gp-question">Do you have your own workout plan?</p>
        <div className="gp-choice-grid">
          <button className="gp-choice" onClick={() => setMode('own')}>
            <span className="gpc-icon">📝</span>
            <span className="gpc-title">Yes, I have my own</span>
            <span className="gpc-desc">Input your custom exercises, sets, and reps for each day</span>
          </button>
          <button className="gp-choice" onClick={() => setMode('recommended')}>
            <span className="gpc-icon">⚡</span>
            <span className="gpc-title">No, recommend me one</span>
            <span className="gpc-desc">Get a scientifically designed plan based on your fitness goal</span>
          </button>
        </div>
      </div>
    )
  }

  // ===== RECOMMENDED PLANS =====
  if (mode === 'recommended') {
    return (
      <div className="gym-plan-section">
        <div className="gp-header">
          <span className="gp-icon">⚡</span>
          <h2>Choose Your Plan</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => { setMode(null); setSelectedPlan(null) }}>← Back</button>
        </div>

        {!selectedPlan ? (
          <div className="plan-cards">
            {Object.entries(RECOMMENDED_PLANS).map(([key, plan]) => (
              <button key={key} className="plan-card" onClick={() => setSelectedPlan(key)}>
                <div className="pc-name">{plan.name}</div>
                <div className="pc-info">{plan.split}</div>
                <div className="pc-days">{plan.days.length} workout days</div>
                <div className="pc-goal">Goal: {plan.goal}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="plan-detail">
            <div className="pd-header">
              <div>
                <h3 className="pd-name">{RECOMMENDED_PLANS[selectedPlan].name}</h3>
                <p className="pd-split">{RECOMMENDED_PLANS[selectedPlan].split}</p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedPlan(null)}>← All Plans</button>
            </div>

            <div className="pd-days">
              {RECOMMENDED_PLANS[selectedPlan].days.map((day, i) => {
                const totalCal = day.exercises.reduce((s, e) => s + e.cal, 0)
                const isExpanded = expandedDay === i
                return (
                  <div key={i} className={`pd-day ${isExpanded ? 'expanded' : ''}`}>
                    <button className="pd-day-header" onClick={() => setExpandedDay(isExpanded ? null : i)}>
                      <div className="pd-day-left">
                        <span className="pd-day-name">{day.day}</span>
                        <span className="pd-day-title">{day.title}</span>
                      </div>
                      <div className="pd-day-right">
                        <span className="pd-day-count">{day.exercises.length} exercises</span>
                        <span className="pd-day-cal">{totalCal} cal</span>
                        <span className="pd-arrow">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="pd-exercises">
                        {day.exercises.map((ex, j) => (
                          <div className="pd-exercise" key={j}>
                            <span className="pde-num">{j + 1}</span>
                            <span className="pde-name">{ex.name}</span>
                            <span className="pde-detail">{ex.sets} × {ex.reps}</span>
                            <span className="pde-cal">{ex.cal} cal</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ===== CUSTOM PLAN BUILDER =====
  return (
    <div className="gym-plan-section">
      <div className="gp-header">
        <span className="gp-icon">📝</span>
        <h2>Build Your Plan</h2>
        <button className="btn btn-ghost btn-sm" onClick={() => setMode(null)}>← Back</button>
      </div>

      <div className="custom-days">
        {customDays.map((day, di) => (
          <div className="custom-day" key={di}>
            <div className="cd-header">
              <span className="cd-day-label">{day.day}</span>
              <input type="text" className="cd-title-input" placeholder="e.g. Chest & Triceps"
                value={day.title} onChange={e => updateDayTitle(di, e.target.value)} />
              {customDays.length > 1 && (
                <button className="cd-remove-day" onClick={() => removeDay(di)}>✕</button>
              )}
            </div>
            <div className="cd-exercises">
              {day.exercises.map((ex, ei) => (
                <div className="cd-exercise-row" key={ei}>
                  <input type="text" placeholder="Exercise name" value={ex.name}
                    onChange={e => updateExercise(di, ei, 'name', e.target.value)} className="cde-name" />
                  <input type="text" placeholder="Sets" value={ex.sets}
                    onChange={e => updateExercise(di, ei, 'sets', e.target.value)} className="cde-small" />
                  <input type="text" placeholder="Reps" value={ex.reps}
                    onChange={e => updateExercise(di, ei, 'reps', e.target.value)} className="cde-small" />
                  <input type="number" placeholder="Cal" value={ex.cal}
                    onChange={e => updateExercise(di, ei, 'cal', e.target.value)} className="cde-small" />
                  {day.exercises.length > 1 && (
                    <button className="cde-remove" onClick={() => removeExercise(di, ei)}>✕</button>
                  )}
                </div>
              ))}
              <button className="btn btn-ghost btn-sm cd-add-ex" onClick={() => addExercise(di)}>+ Add Exercise</button>
            </div>
          </div>
        ))}
      </div>

      {customDays.length < 7 && (
        <button className="btn btn-outline cd-add-day" onClick={addDay}>+ Add Another Day</button>
      )}
    </div>
  )
}
