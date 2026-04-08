import './Skeleton.css'

export default function Skeleton({ shape = 'line', width = '100%', height = '16px', count = 1 }) {
  const skeletons = Array(count).fill(0)

  return (
    <div className="skeleton-wrapper">
      {skeletons.map((_, i) => (
        <div
          key={i}
          className={`skeleton skeleton-${shape}`}
          style={{
            width,
            height,
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  )
}
