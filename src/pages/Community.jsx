import { useState, useEffect, useCallback } from 'react'
import { useFitTrack, fetchCommunityFeed, createCommunityPost, togglePostLike, addPostComment, fetchChallenges, joinChallengeAPI, fetchLeaderboard } from '../context/FitTrackContext'
import DashNav from '../components/DashNav'
import Footer from '../components/Footer'
import './Community.css'

/* ── Post Type Config ── */
const POST_TYPES = [
  { key: 'general', label: '💬 General', icon: '💬' },
  { key: 'workout', label: '🏋️ Workout', icon: '🏋️' },
  { key: 'achievement', label: '🏆 Achievement', icon: '🏆' },
  { key: 'milestone', label: '🎯 Milestone', icon: '🎯' },
]

const QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Sore today, strong tomorrow.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Fitness is not about being better than someone else. It's about being better than you used to be.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Don't stop when you're tired. Stop when you're done.",
]

function timeAgo(dateStr) {
  const now = new Date()
  const then = new Date(dateStr)
  const diffMs = now - then
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  return then.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

/* ── Skeleton Loader ── */
function Skeleton({ width = '100%', height = '16px', borderRadius = '8px', style }) {
  return (
    <div className="skeleton-pulse" style={{ width, height, borderRadius, ...style }} />
  )
}

function FeedSkeleton() {
  return (
    <div className="community-feed">
      {[0, 1, 2].map(i => (
        <div className="feed-card skeleton-card" key={i}>
          <div className="fc-left">
            <Skeleton width="44px" height="44px" borderRadius="50%" />
          </div>
          <div className="fc-body" style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <Skeleton width="120px" height="14px" />
              <Skeleton width="50px" height="14px" />
            </div>
            <Skeleton width="80%" height="14px" style={{ marginBottom: 6 }} />
            <Skeleton width="60%" height="14px" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Create Post Card ── */
function CreatePostCard({ profile, onPostCreated }) {
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState('general')
  const [submitting, setSubmitting] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const displayName = profile?.name || 'User'
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const typeConfig = POST_TYPES.find(t => t.key === postType)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim() || submitting) return
    setSubmitting(true)
    const post = await createCommunityPost(content.trim(), postType, typeConfig.icon)
    if (post) {
      onPostCreated(post)
      setContent('')
      setPostType('general')
      setIsFocused(false)
    }
    setSubmitting(false)
  }

  return (
    <div className={`create-post-card ${isFocused ? 'focused' : ''}`}>
      <div className="cp-header">
        <div className="cp-avatar">{initials}</div>
        <textarea
          className="cp-input"
          placeholder="Share your fitness journey..."
          value={content}
          onChange={e => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          maxLength={1000}
          rows={isFocused ? 3 : 1}
        />
      </div>
      {isFocused && (
        <div className="cp-actions animate-fade-in">
          <div className="cp-types">
            {POST_TYPES.map(t => (
              <button
                key={t.key}
                className={`cp-type-btn ${postType === t.key ? 'active' : ''}`}
                onClick={() => setPostType(t.key)}
                type="button"
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="cp-submit-row">
            <span className="cp-char-count">{content.length}/1000</span>
            <button
              className="btn btn-primary btn-sm cp-submit"
              onClick={handleSubmit}
              disabled={!content.trim() || submitting}
            >
              {submitting ? '⏳ Posting...' : '📤 Post'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Comment Section ── */
function CommentSection({ postId, comments: initialComments }) {
  const [comments, setComments] = useState(initialComments || [])
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [expanded, setExpanded] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim() || submitting) return
    setSubmitting(true)
    const comment = await addPostComment(postId, text.trim())
    if (comment) {
      setComments(prev => [...prev, comment])
      setText('')
    }
    setSubmitting(false)
  }

  const displayComments = expanded ? comments : comments.slice(0, 2)

  return (
    <div className="comment-section">
      {comments.length > 0 && (
        <div className="cs-list">
          {displayComments.map((c, i) => (
            <div className="cs-comment" key={c._id || i}>
              <div className="cs-avatar">{c.user.avatar}</div>
              <div className="cs-body">
                <span className="cs-name">{c.user.name}</span>
                <span className="cs-text">{c.text}</span>
                <span className="cs-time">{timeAgo(c.createdAt)}</span>
              </div>
            </div>
          ))}
          {comments.length > 2 && !expanded && (
            <button className="cs-expand" onClick={() => setExpanded(true)}>
              View {comments.length - 2} more comment{comments.length - 2 > 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}
      <form className="cs-form" onSubmit={handleSubmit}>
        <input
          className="cs-input"
          placeholder="Write a comment..."
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={500}
        />
        <button className="cs-send" disabled={!text.trim() || submitting} type="submit">
          {submitting ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  )
}

/* ── Empty State ── */
function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="community-empty">
      <span className="ce-icon">{icon}</span>
      <h3 className="ce-title">{title}</h3>
      <p className="ce-sub">{subtitle}</p>
    </div>
  )
}

export default function Community() {
  const { profile, today, caloriesBurned } = useFitTrack()
  const [tab, setTab] = useState('feed')

  // Feed state
  const [posts, setPosts] = useState([])
  const [feedLoading, setFeedLoading] = useState(true)
  const [feedPage, setFeedPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Challenges state
  const [challenges, setChallenges] = useState([])
  const [challengesLoading, setChallengesLoading] = useState(true)

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState([])
  const [lbLoading, setLbLoading] = useState(true)
  const [podiumVisible, setPodiumVisible] = useState(false)

  const [toast, setToast] = useState('')
  const quote = QUOTES[new Date().getDate() % QUOTES.length]

  // My stats
  const myWorkoutsDone = today.workouts.filter(w => w.done).length

  const displayName = profile?.name || 'You'
  const displayInitials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  // Load feed
  const loadFeed = useCallback(async (page = 1) => {
    setFeedLoading(true)
    const data = await fetchCommunityFeed(page)
    if (page === 1) {
      setPosts(data.posts)
    } else {
      setPosts(prev => [...prev, ...data.posts])
    }
    setFeedPage(data.page)
    setTotalPages(data.totalPages)
    setFeedLoading(false)
  }, [])

  // Load challenges
  const loadChallenges = useCallback(async () => {
    setChallengesLoading(true)
    const data = await fetchChallenges()
    setChallenges(data)
    setChallengesLoading(false)
  }, [])

  // Load leaderboard
  const loadLeaderboard = useCallback(async () => {
    setLbLoading(true)
    const data = await fetchLeaderboard()
    setLeaderboard(data)
    setLbLoading(false)
    setPodiumVisible(false)
    setTimeout(() => setPodiumVisible(true), 100)
  }, [])

  // Load data on tab change
  useEffect(() => {
    if (tab === 'feed') loadFeed(1)
    else if (tab === 'challenges') loadChallenges()
    else if (tab === 'leaderboard') loadLeaderboard()
  }, [tab, loadFeed, loadChallenges, loadLeaderboard])

  function handlePostCreated(post) {
    setPosts(prev => [post, ...prev])
    showToast('Post shared! 🎉')
  }

  async function handleLike(postId, index) {
    const result = await togglePostLike(postId)
    if (result && result.success) {
      setPosts(prev => prev.map((p, i) =>
        i === index ? { ...p, likes: result.likes, isLiked: result.isLiked } : p
      ))
    }
  }

  async function handleJoinChallenge(challengeId, index) {
    const result = await joinChallengeAPI(challengeId)
    if (result && result.success) {
      setChallenges(prev => prev.map((ch, i) =>
        i === index ? { ...ch, isJoined: true, participants: result.participants } : ch
      ))
      showToast(result.message)
    } else if (result && result.message) {
      showToast(result.message)
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  // Find my entry in leaderboard
  const myEntry = leaderboard.find(e => e.isYou)

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
              {myEntry && <span className="ms-badge ms-rank">#{myEntry.rank}</span>}
              {myEntry && <span className="ms-badge ms-points">{myEntry.score.toLocaleString()} pts</span>}
              {myEntry && <span className="ms-badge ms-streak">🔥 {myEntry.streak} day streak</span>}
              {!myEntry && <span className="ms-badge ms-rank">Loading...</span>}
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
          <div className="animate-fade-in">
            <CreatePostCard profile={profile} onPostCreated={handlePostCreated} />

            {feedLoading && posts.length === 0 ? (
              <FeedSkeleton />
            ) : posts.length === 0 ? (
              <EmptyState
                icon="📝"
                title="No posts yet"
                subtitle="Be the first to share your fitness journey!"
              />
            ) : (
              <div className="community-feed">
                {posts.map((post, i) => (
                  <div className="feed-card" key={post._id} style={{ animationDelay: `${i * 0.06}s` }}>
                    <div className="fc-left">
                      <div className="fc-avatar-ring" style={{ background: 'linear-gradient(135deg, #AAFF00, #88cc00)' }}>
                        <div className="fc-avatar">{post.user.avatar}</div>
                      </div>
                    </div>
                    <div className="fc-body">
                      <div className="fc-header">
                        <span className="fc-name">{post.user.name}</span>
                        <span className="fc-level" style={{ borderColor: 'var(--green)', color: 'var(--green)', background: 'var(--green-bg)' }}>
                          {post.type}
                        </span>
                        <span className="fc-time">{timeAgo(post.createdAt)}</span>
                      </div>
                      <div className="fc-action">
                        <span className="fc-icon">{post.icon}</span>
                        <span className="fc-verb">{post.type}</span>
                      </div>
                      <div className="fc-detail">{post.content}</div>
                      <div className="fc-actions">
                        <button
                          className={`fc-like ${post.isLiked ? 'liked' : ''}`}
                          onClick={() => handleLike(post._id, i)}
                        >
                          {post.isLiked ? '❤️' : '🤍'} {post.likes}
                        </button>
                        <button className="fc-comment">💬 {post.comments.length}</button>
                      </div>
                      <CommentSection postId={post._id} comments={post.comments} />
                    </div>
                  </div>
                ))}

                {/* Load More */}
                {feedPage < totalPages && (
                  <button
                    className="btn btn-outline load-more-btn"
                    onClick={() => loadFeed(feedPage + 1)}
                    disabled={feedLoading}
                  >
                    {feedLoading ? '⏳ Loading...' : '📜 Load More'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== CHALLENGES ===== */}
        {tab === 'challenges' && (
          <div className="animate-fade-in">
            {challengesLoading ? (
              <div className="challenges-grid">
                {[0, 1, 2].map(i => (
                  <div className="challenge-card skeleton-card" key={i}>
                    <Skeleton width="48px" height="48px" borderRadius="12px" style={{ marginBottom: 12 }} />
                    <Skeleton width="70%" height="18px" style={{ marginBottom: 8 }} />
                    <Skeleton width="100%" height="13px" style={{ marginBottom: 6 }} />
                    <Skeleton width="80%" height="13px" style={{ marginBottom: 16 }} />
                    <Skeleton width="100%" height="6px" borderRadius="6px" style={{ marginBottom: 12 }} />
                    <Skeleton width="100%" height="38px" borderRadius="8px" />
                  </div>
                ))}
              </div>
            ) : challenges.length === 0 ? (
              <EmptyState
                icon="🏆"
                title="No active challenges"
                subtitle="Check back soon for new challenges!"
              />
            ) : (
              <div className="challenges-grid">
                {challenges.map((ch, i) => (
                  <div className="challenge-card" key={ch._id} style={{ '--ch-color': ch.color, animationDelay: `${i * 0.08}s` }}>
                    <div className="ch-top-row">
                      <div className="ch-icon">{ch.icon}</div>
                      <div className="ch-difficulty-badge" style={{ color: ch.color, borderColor: ch.color, background: `${ch.color}15` }}>
                        {ch.difficulty}
                      </div>
                    </div>
                    <h3 className="ch-name">{ch.name}</h3>
                    <p className="ch-desc">{ch.description}</p>

                    {/* Progress bar */}
                    <div className="ch-progress-wrap">
                      <div className="ch-progress-bar">
                        <div className="ch-progress-fill" style={{ width: ch.isJoined ? `${ch.progress}%` : '0%', background: ch.color }}></div>
                      </div>
                      <div className="ch-progress-text">
                        <span>{ch.isJoined ? `${ch.progress}% complete` : '—'}</span>
                        <span style={{ color: ch.color }}>{ch.isJoined ? `${ch.progress}%` : ''}</span>
                      </div>
                    </div>

                    <div className="ch-meta">
                      <span className="ch-participants">👥 {ch.participants} joined</span>
                      <span className="ch-countdown">⏱ {ch.daysLeft} days left</span>
                    </div>
                    <div className="ch-meta">
                      <span className="ch-reward">{ch.reward}</span>
                    </div>

                    {ch.isJoined ? (
                      <button className="btn btn-outline ch-btn joined" disabled>✅ Joined</button>
                    ) : (
                      <button className="btn btn-primary ch-btn" onClick={() => handleJoinChallenge(ch._id, i)}>Join Challenge →</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== LEADERBOARD ===== */}
        {tab === 'leaderboard' && (
          <div className="leaderboard animate-fade-in">
            {lbLoading ? (
              <div style={{ padding: '40px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Skeleton width="48px" height="48px" borderRadius="50%" style={{ marginBottom: 8 }} />
                      <Skeleton width="60px" height="12px" style={{ marginBottom: 4 }} />
                      <Skeleton width="40px" height="100px" borderRadius="8px 8px 0 0" />
                    </div>
                  ))}
                </div>
                {[0, 1, 2, 3].map(i => (
                  <Skeleton key={i} width="100%" height="48px" borderRadius="8px" style={{ marginBottom: 4 }} />
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <EmptyState
                icon="🥇"
                title="No leaderboard data"
                subtitle="Complete workouts to appear on the leaderboard!"
              />
            ) : (
              <>
                {/* Top 3 podium */}
                {leaderboard.length >= 3 && (
                  <div className={`podium ${podiumVisible ? 'podium-visible' : ''}`}>
                    {[1, 0, 2].map((idx, posIdx) => {
                      const u = leaderboard[idx]
                      if (!u) return null
                      const heights = ['160px', '200px', '130px']
                      const delays = ['0.3s', '0.1s', '0.5s']
                      return (
                        <div className={`podium-item rank-${u.rank}`} key={u.rank}
                          style={{ '--rise-delay': delays[posIdx] }}>
                          <div className="pod-avatar">{u.avatar}</div>
                          <div className="pod-name">{u.name}</div>
                          <div className="pod-score">{u.score} pts</div>
                          <div className="pod-bar" style={{ '--bar-height': heights[posIdx] }}>
                            <span className="pod-medal">{['🥈', '🥇', '🥉'][posIdx]}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Full list */}
                <div className="lb-table">
                  <div className="lb-header-row">
                    <span className="lb-rank">Rank</span>
                    <span className="lb-user">User</span>
                    <span className="lb-stat">Score</span>
                    <span className="lb-stat">Workouts</span>
                    <span className="lb-stat">Streak</span>
                  </div>
                  {leaderboard.map((u, i) => (
                    <div className={`lb-row ${u.rank <= 3 ? 'top-3' : ''} ${u.isYou ? 'lb-you' : ''}`} key={u._id}
                      style={{ animationDelay: `${0.6 + i * 0.08}s` }}>
                      <span className="lb-rank">
                        {u.rank <= 3 ? ['🥇', '🥈', '🥉'][u.rank - 1] : `#${u.rank}`}
                      </span>
                      <span className="lb-user">
                        <span className={`lb-avatar ${u.isYou ? 'lb-avatar-you' : ''}`}>{u.avatar}</span>
                        {u.name}
                        {u.isYou && <span className="lb-you-tag">YOU</span>}
                      </span>
                      <span className="lb-stat lb-score">{u.score}</span>
                      <span className="lb-stat">{u.workouts}</span>
                      <span className="lb-stat">{u.streak} days</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>
      <Footer />
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
