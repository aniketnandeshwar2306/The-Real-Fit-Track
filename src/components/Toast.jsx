import { useToast } from '../context/ToastContext'
import './Toast.css'

export default function Toast() {
  const { toasts } = useToast()

  return (
    <div className="toast-container">
      {toasts.map(({ id, message, type }) => (
        <div key={id} className={`toast toast-${type}`}>
          {type === 'success' && <span className="toast-icon">✓</span>}
          {type === 'error' && <span className="toast-icon">✕</span>}
          {type === 'info' && <span className="toast-icon">ℹ</span>}
          <span className="toast-message">{message}</span>
        </div>
      ))}
    </div>
  )
}
