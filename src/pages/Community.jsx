import { useState } from 'react'
import DashNav from '../components/DashNav'
import Footer from '../components/Footer'
import './Community.css'

// Simulated community data
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
  { name: '10K Steps Challenge', icon: '👣', participants: 234, duration: '7 days', reward: '🏅 Step Master Badge', desc: 'Walk 10,000 steps every day for a week', difficulty: 'Easy', color: '#22c55e' },
  { name: 'Hydration Hero', icon: '💧', participants: 189, duration: '5 days', reward: '🏅 Hydration Badge', desc: 'Drink 3L water daily for 5 days straight', difficulty: 'Easy', color: '#3b82f6' },
  { name: 'Push-Up Warrior', icon: '💪', participants: 156, duration: '30 days', reward: '🏅 Warrior Badge', desc: 'Do 100 push-ups daily for a month', difficulty: 'Hard', color: '#ef4444' },
  { name: 'Clean Eating Week', icon: '🥗', participants: 312, duration: '7 days', reward: '🏅 Nutrition Badge', desc: 'Stay under your calorie target every day', difficulty: 'Medium', color: '#f59e0b' },
  { name: 'Morning Runner', icon: '🌅', participants: 98, duration: '14 days', reward: '🏅 Early Bird Badge', desc: 'Run 3km before 7 AM for 2 weeks', difficulty: 'Hard', color: '#8b5cf6' },
  { name: 'Yoga Flow', icon: '🧘', participants: 267, duration: '21 days', reward: '🏅 Zen Badge', desc: '15 min yoga session daily for 21 days', difficulty: 'Medium', color: '#ec4899' },
]

const LEADERBOARD = [
  { rank: 1, name: 'Vikram Singh', avatar: 'VS', score: 2850, workouts: 28, streak: 14 },
  { rank: 2, name: 'Priya Patel', avatar: 'PP', score: 2640, workouts: 25, streak: 12 },
  { rank: 3, name: 'Amit Kumar', avatar: 'AK', score: 2380, workouts: 22, streak: 9 },
  { rank: 4, name: 'Neha Gupta', avatar: 'NG', score: 2100, workouts: 20, streak: 7 },
  { rank: 5, name: 'Rahul Sharma', avatar: 'RS', score: 1950, workouts: 18, streak: 5 },
  { rank: 6, name: 'Ananya Reddy', avatar: 'AR', score: 1720, workouts: 16, streak: 4 },
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
  const [tab, setTab] = useState('feed')
  const [likedPosts, setLikedPosts] = useState({})
  const [joinedChallenges, setJoinedChallenges] = useState({})
  const [toast, setToast] = useState('')

  const quote = QUOTES[new Date().getDate() % QUOTES.length]

  function toggleLike(i) {
    setLikedPosts(prev => ({ ...prev, [i]: !prev[i] }))
  }

  function joinChallenge(i) {
    setJoinedChallenges(prev => ({ ...prev, [i]: true }))
    setToast(`Joined "${CHALLENGES[i].name}"! 🎉`)
    setTimeout(() => setToast(''), 2500)
  }

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

        {/* Tabs */}
        <div className="progress-tabs animate-slide-up delay-2">
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
            {FEED.map((post, i) => (
              <div className="feed-card" key={i}>
                <div className="fc-left">
                  <div className="fc-avatar">{post.user.avatar}</div>
                </div>
                <div className="fc-body">
                  <div className="fc-header">
                    <span className="fc-name">{post.user.name}</span>
                    <span className="fc-level">{post.user.level}</span>
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
            ))}
          </div>
        )}

        {/* ===== CHALLENGES ===== */}
        {tab === 'challenges' && (
          <div className="challenges-grid animate-fade-in">
            {CHALLENGES.map((ch, i) => (
              <div className="challenge-card" key={i} style={{ borderTopColor: ch.color }}>
                <div className="ch-icon">{ch.icon}</div>
                <h3 className="ch-name">{ch.name}</h3>
                <p className="ch-desc">{ch.desc}</p>
                <div className="ch-meta">
                  <span className="ch-difficulty" style={{ color: ch.color }}>{ch.difficulty}</span>
                  <span className="ch-duration">⏱ {ch.duration}</span>
                </div>
                <div className="ch-meta">
                  <span className="ch-participants">👥 {ch.participants} joined</span>
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
            <div className="podium">
              {[1, 0, 2].map(idx => {
                const u = LEADERBOARD[idx]
                const heights = ['160px', '200px', '130px']
                const labels = ['🥈', '🥇', '🥉']
                return (
                  <div className={`podium-item rank-${u.rank}`} key={u.rank}>
                    <div className="pod-avatar">{u.avatar}</div>
                    <div className="pod-name">{u.name.split(' ')[0]}</div>
                    <div className="pod-score">{u.score} pts</div>
                    <div className="pod-bar" style={{ height: heights[idx === 0 ? 1 : idx === 1 ? 0 : 2] }}>
                      <span className="pod-medal">{labels[idx === 0 ? 1 : idx === 1 ? 0 : 2]}</span>
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
              {LEADERBOARD.map(u => (
                <div className={`lb-row ${u.rank <= 3 ? 'top-3' : ''}`} key={u.rank}>
                  <span className="lb-rank">{u.rank <= 3 ? ['🥇','🥈','🥉'][u.rank-1] : `#${u.rank}`}</span>
                  <span className="lb-user">
                    <span className="lb-avatar">{u.avatar}</span>
                    {u.name}
                  </span>
                  <span className="lb-stat lb-score">{u.score}</span>
                  <span className="lb-stat">{u.workouts}</span>
                  <span className="lb-stat">{u.streak} days</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
