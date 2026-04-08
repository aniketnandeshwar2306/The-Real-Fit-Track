import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5',
          padding: '20px'
        }}>
          <h1 style={{ fontSize: '32px', color: '#333', marginBottom: '10px' }}>Oops!</h1>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
            Something went wrong. Please refresh the page.
          </p>
          <details style={{ whiteSpace: 'pre-wrap', color: '#999', maxWidth: '600px', marginBottom: '20px' }}>
            {this.state.error?.toString()}
          </details>
          <button onClick={() => window.location.reload()} style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Refresh Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
