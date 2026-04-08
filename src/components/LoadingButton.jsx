import Spinner from './Spinner'
import './LoadingButton.css'

export default function LoadingButton({ loading = false, disabled = false, children, onClick, className = '' }) {
  return (
    <button
      className={`loading-btn ${className} ${loading ? 'loading-btn--loading' : ''}`}
      disabled={loading || disabled}
      onClick={onClick}
    >
      {loading ? (
        <>
          <div className="loading-btn__spinner">
            <Spinner size="sm" color="white" />
          </div>
          <span className="loading-btn__text">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
