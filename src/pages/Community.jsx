import { useState, useEffect } from 'react'
import { useFitTrack } from '../context/FitTrackContext'
import DashNav from '../components/DashNav'
import Footer from '../components/Footer'
import './Community.css'

/* ── Level config ── */
const LEVEL_COLORS = {
  Beginner: { gradient: 'linear-gradient(135deg, #666, #888)', border: '#888', bg: 'rgba(136,136,136,0.08)' },
  Pro: { gradient: 'linear-gradient(135deg, #AAFF00, #88cc00)', border: 'var(--green)', bg: 'var(--green-bg)' },
  Elite: { gradient: 'linear-gradient(135deg, #ffd700, #ffaa00)', border: '#ffd700', bg: 'rgba(255,215,0,0.08)' },
  Warrior: { gradient: 'linear-gradient(135deg, #ff4444, #cc2222)', border: '#ff4444', bg: 'rgba(255,68,68,0.08)' },
  Legend: { gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', border: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
}

function getLevelColor(level) {
  return LEVEL_COLORS[level] || LEVEL_COLORS.Beginner
}

/* ── Simulated community data ── */
const USERS = [
  { name: 'Rahul Sharma', avatar: 'RS', level: 'Pro' },
  { name: 'Priya Patel', avatar: 'PP', level: 'Elite' },
  { name: 'Amit Kumar', avatar: 'AK', level: 'Warrior' },
  { name: 'Neha Gupta', avatar: 'NG', level: 'Pro' },
  { name: 'Vikram Singh', avatar: 'VS', level: 'Legend' },
  { name: 'Ananya Reddy', avatar: 'AR', level: 'Warrior' },
]

const FEED = [
  { user: USERS[0], action: 'completed', detail: 'Push Day — 5 exercises, 420 cal burned', time: '2 min ago', likes: 12, icon: '🏋️' },
  { user: USERS[1], action: 'achieved', detail: '7-Day Workout Streak! 🔥', time: '15 min ago', likes: 34, icon: '🏆' },
  { user: USERS[2], action: 'logged', detail: 'Cricket — 90 min, 525 cal burned', time: '1 hr ago', likes: 8, icon: '🏏' },
  { user: USERS[3], action: 'hit target', detail: 'Daily calorie goal reached — 1,850 cal', time: '2 hrs ago', likes: 15, icon: '🎯' },
  { user: USERS[4], action: 'completed', detail: 'Leg Day — Squats 120kg PR! 💪', time: '3 hrs ago', likes: 52, icon: '🦵' },
  { user: USERS[5], action: 'logged', detail: '10K steps + 3L water today', time: '4 hrs ago', likes: 21, icon: '👣' },
  { user: USERS[0], action: 'joined', detail: '10K Steps Challenge', time: '5 hrs ago', likes: 5, icon: '🏃' },
  { user: USERS[3], action: 'shared', detail: 'Monthly progress: -2.5kg weight loss!', time: '6 hrs ago', likes: 45, icon: '📊' },
]

const CHALLENGES = [
  { name: '10K Steps Challenge', icon: '👣', participants: 234, duration: 7, daysLeft: 3, progress: 57, reward: '🏅 Step Master Badge', desc: 'Walk 10,000 steps every day for a week', difficulty: 'Easy', color: '#22c55e' },
  { name: 'Hydration Hero', icon: '💧', participants: 189, duration: 5, daysLeft: 2, progress: 60, reward: '🏅 Hydration Badge', desc: 'Drink 3L water daily for 5 days straight', difficulty: 'Easy', color: '#3b82f6' },
  { name: 'Push-Up Warrior', icon: '💪', participants: 156, duration: 30, daysLeft: 18, progress: 40, reward: '🏅 Warrior Badge', desc: 'Do 100 push-ups daily for a month', difficulty: 'Hard', color: '#ef4444' },
  { name: 'Clean Eating Week', icon: '🥗', participants: 312, duration: 7, daysLeft: 5, progress: 28, reward: '🏅 Nutrition Badge', desc: 'Stay under your calorie target every day', difficulty: 'Medium', color: '#f59e0b' },
  { name: 'Morning Runner', icon: '🌅', participants: 98, duration: 14, daysLeft: 9, progress: 35, reward: '🏅 Early Bird Badge', desc: 'Run 3km before 7 AM for 2 weeks', difficulty: 'Hard', color: '#8b5cf6' },
  { name: 'Yoga Flow', icon: '🧘', participants: 267, duration: 21, daysLeft: 14, progress: 33, reward: '🏅 Zen Badge', desc: '15 min yoga session daily for 21 days', difficulty: 'Medium', color: '#ec4899' },
]

const LEADERBOARD = [
  { rank: 1, name: 'Vikram Singh', avatar: 'VS', score: 2850, workouts: 28, streak: 14, change: 0 },
  { rank: 2, name: 'Priya Patel', avatar: 'PP', score: 2640, workouts: 25, streak: 12, change: 1 },
  { rank: 3, name: 'Amit Kumar', avatar: 'AK', score: 2380, workouts: 22, streak: 9, change: -1 },
  { rank: 4, name: 'Neha Gupta', avatar: 'NG', score: 2100, workouts: 20, streak: 7, change: 2 },
  { rank: 5, name: 'Rahul Sharma', avatar: 'RS', score: 1950, workouts: 18, streak: 5, change: 0 },
  { rank: 6, name: 'Ananya Reddy', avatar: 'AR', score: 1720, workouts: 16, streak: 4, change: -2 },
]

const QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Sore today, strong tomorrow.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Fitness is not about being better than someone else. It's about being better than you used to be.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Don't stop when you're tired. Stop when you're done.",
]

export default function Community() {
  const { profile, today, caloriesBurned } = useFitTrack()
  const [tab, setTab] = useState('feed')
  const [likedPosts, setLikedPosts] = useState({})
  const [joinedChallenges, setJoinedChallenges] = useState({})
  const [toast, setToast] = useState('')
  const [podiumVisible, setPodiumVisible] = useState(false)

  const quote = QUOTES[new Date().getDate() % QUOTES.length]

  // Animate podium on tab switch
  useEffect(() => {
    if (tab === 'leaderboard') {
      setPodiumVisible(false)
      setTimeout(() => setPodiumVisible(true), 100)
    }
  }, [tab])

  function toggleLike(i) {
    setLikedPosts(prev => ({ ...prev, [i]: !prev[i] }))
  }

  function joinChallenge(i) {
    setJoinedChallenges(prev => ({ ...prev, [i]: true }))
    setToast(`Joined "${CHALLENGES[i].name}"! 🎉`)
    setTimeout(() => setToast(''), 2500)
  }

  // The current user's simulated stats
  const myWorkoutsDone = today.workouts.filter(w => w.done).length
  const myStreak = 3 // simulated
  const myScore = 1200 + (myWorkoutsDone * 50) + (caloriesBurned > 0 ? 100 : 0)
  const myRank = LEADERBOARD.filter(u => u.score > myScore).length + 1
  const displayName = profile?.name || 'You'
  const displayInitials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="dashboard">
      <DashNav />
      <main className="dash-main">
        <h1 className="page-title animate-slide-up">COMMUNITY</h1>
        <p className="page-sub animate-slide-up delay-1">Connect, compete, and grow with fellow fitness enthusiasts.</p>

        {/* Daily quote */}
        <div className="daily-quote animate-slide-up delay-2">
          <span className="dq-icon">💬</span>
          <p>"{quote}"</p>
        </div>

        {/* My Stats Hero Card */}
        <div className="my-stats-card animate-slide-up delay-2">
          <div className="ms-avatar-wrap">
            <div className="ms-avatar">{displayInitials}</div>
            <div className="ms-avatar-ring"></div>
          </div>
          <div className="ms-info">
            <h3 className="ms-name">{displayName}</h3>
            <div className="ms-badges">
              <span className="ms-badge ms-rank">#{myRank}</span>
              <span className="ms-badge ms-points">{myScore.toLocaleString()} pts</span>
              <span className="ms-badge ms-streak">🔥 {myStreak} day streak</span>
            </div>
          </div>
          <div className="ms-today">
            <div className="ms-today-stat">
              <span className="mts-val">{myWorkoutsDone}</span>
              <span className="mts-lbl">Workouts</span>
            </div>
            <div className="ms-today-stat">
              <span className="mts-val">{caloriesBurned}</span>
              <span className="mts-lbl">Cal Burned</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="progress-tabs animate-slide-up delay-3">
          {[
            { key: 'feed', icon: '📰', label: 'Feed' },
            { key: 'challenges', icon: '🏆', label: 'Challenges' },
            { key: 'leaderboard', icon: '🥇', label: 'Leaderboard' },
          ].map(t => (
            <button key={t.key} className={`ptab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ===== FEED ===== */}
        {tab === 'feed' && (
          <div className="community-feed animate-fade-in">
            {FEED.map((post, i) => {
              const lvl = getLevelColor(post.user.level)
              return (
                <div className="feed-card" key={i} style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="fc-left">
                    <div className="fc-avatar-ring" style={{ background: lvl.gradient }}>
                      <div className="fc-avatar">{post.user.avatar}</div>
                    </div>
                  </div>
                  <div className="fc-body">
                    <div className="fc-header">
                      <span className="fc-name">{post.user.name}</span>
                      <span className="fc-level" style={{ borderColor: lvl.border, color: lvl.border, background: lvl.bg }}>{post.user.level}</span>
                      <span className="fc-time">{post.time}</span>
                    </div>
                    <div className="fc-action">
                      <span className="fc-icon">{post.icon}</span>
                      <span className="fc-verb">{post.action}</span>
                    </div>
                    <div className="fc-detail">{post.detail}</div>
                    <div className="fc-actions">
                      <button className={`fc-like ${likedPosts[i] ? 'liked' : ''}`} onClick={() => toggleLike(i)}>
                        {likedPosts[i] ? '❤️' : '🤍'} {post.likes + (likedPosts[i] ? 1 : 0)}
                      </button>
                      <button className="fc-comment">💬 Comment</button>
                      <button className="fc-share">🔗 Share</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ===== CHALLENGES ===== */}
        {tab === 'challenges' && (
          <div className="challenges-grid animate-fade-in">
            {CHALLENGES.map((ch, i) => (
              <div className="challenge-card" key={i} style={{ '--ch-color': ch.color, animationDelay: `${i * 0.08}s` }}>
                <div className="ch-top-row">
                  <div className="ch-icon">{ch.icon}</div>
                  <div className="ch-difficulty-badge" style={{ color: ch.color, borderColor: ch.color, background: `${ch.color}15` }}>{ch.difficulty}</div>
                </div>
                <h3 className="ch-name">{ch.name}</h3>
                <p className="ch-desc">{ch.desc}</p>

                {/* Progress bar */}
                <div className="ch-progress-wrap">
                  <div className="ch-progress-bar">
                    <div className="ch-progress-fill" style={{ width: joinedChallenges[i] ? `${ch.progress}%` : '0%', background: ch.color }}></div>
                  </div>
                  <div className="ch-progress-text">
                    <span>{joinedChallenges[i] ? `${ch.duration - ch.daysLeft}/${ch.duration} days` : '—'}</span>
                    <span style={{ color: ch.color }}>{joinedChallenges[i] ? `${ch.progress}%` : ''}</span>
                  </div>
                </div>

                <div className="ch-meta">
                  <span className="ch-participants">👥 {ch.participants + (joinedChallenges[i] ? 1 : 0)} joined</span>
                  <span className="ch-countdown">⏱ {ch.daysLeft} days left</span>
                </div>
                <div className="ch-meta">
                  <span className="ch-reward">{ch.reward}</span>
                </div>

                {joinedChallenges[i] ? (
                  <button className="btn btn-outline ch-btn joined" disabled>✅ Joined</button>
                ) : (
                  <button className="btn btn-primary ch-btn" onClick={() => joinChallenge(i)}>Join Challenge →</button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ===== LEADERBOARD ===== */}
        {tab === 'leaderboard' && (
          <div className="leaderboard animate-fade-in">
            {/* Top 3 podium */}
            <div className={`podium ${podiumVisible ? 'podium-visible' : ''}`}>
              {[1, 0, 2].map((idx, posIdx) => {
                const u = LEADERBOARD[idx]
                const heights = ['160px', '200px', '130px']
                const delays = ['0.3s', '0.1s', '0.5s']
                return (
                  <div className={`podium-item rank-${u.rank}`} key={u.rank}
                    style={{ '--rise-delay': delays[posIdx] }}>
                    <div className="pod-avatar">{u.avatar}</div>
                    <div className="pod-name">{u.name.split(' ')[0]}</div>
                    <div className="pod-score">{u.score} pts</div>
                    <div className="pod-bar" style={{ '--bar-height': heights[posIdx] }}>
                      <span className="pod-medal">{['🥈', '🥇', '🥉'][posIdx]}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Full list */}
            <div className="lb-table">
              <div className="lb-header-row">
                <span className="lb-rank">Rank</span>
                <span className="lb-user">User</span>
                <span className="lb-stat">Score</span>
                <span className="lb-stat">Workouts</span>
                <span className="lb-stat">Streak</span>
              </div>
              {LEADERBOARD.map((u, i) => (
                <div className={`lb-row ${u.rank <= 3 ? 'top-3' : ''}`} key={u.rank}
                  style={{ animationDelay: `${0.6 + i * 0.08}s` }}>
                  <span className="lb-rank">
                    {u.rank <= 3 ? ['🥇','🥈','🥉'][u.rank-1] : `#${u.rank}`}
                  </span>
                  <span className="lb-user">
                    <span className="lb-avatar">{u.avatar}</span>
                    {u.name}
                    {u.change !== 0 && (
                      <span className={`lb-change ${u.change > 0 ? 'up' : 'down'}`}>
                        {u.change > 0 ? `↑${u.change}` : `↓${Math.abs(u.change)}`}
                      </span>
                    )}
                  </span>
                  <span className="lb-stat lb-score">{u.score}</span>
                  <span className="lb-stat">{u.workouts}</span>
                  <span className="lb-stat">{u.streak} days</span>
                </div>
              ))}
              {/* Current user row */}
              <div className="lb-row lb-you">
                <span className="lb-rank">#{myRank}</span>
                <span className="lb-user">
                  <span className="lb-avatar lb-avatar-you">{displayInitials}</span>
                  {displayName} <span className="lb-you-tag">YOU</span>
                </span>
                <span className="lb-stat lb-score">{myScore}</span>
                <span className="lb-stat">{myWorkoutsDone}</span>
                <span className="lb-stat">{myStreak} days</span>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
