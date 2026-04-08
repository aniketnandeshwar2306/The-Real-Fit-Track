import Spinner from './Spinner'
import './LoadingOverlay.css'

export default function LoadingOverlay({ visible = false, spinnerSize = 'md', message = 'Loading...' }) {
  if (!visible) return null

  return (
    <div className="loading-overlay">
      <div className="loading-overlay__content">
        <Spinner size={spinnerSize} color="white" message={message} />
      </div>
    </div>
  )
}
