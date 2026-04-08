import './Spinner.css'

export default function Spinner({ size = 'md', color = 'default', message = '' }) {
  return (
    <div className={`spinner-container spinner-${size}`}>
      <div className={`spinner spinner-${color}`}></div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  )
}
