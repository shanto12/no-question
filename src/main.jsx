import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

class AppErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('No Question runtime error', error)
  }

  render() {
    if (this.state.hasError) {
      return <main className="error-screen" role="alert"><p className="eyebrow">something went sideways</p><h1>The puzzle desk needs a reset.</h1><p>Nothing was lost. Reload the page to return to the current set.</p><button className="button button-primary" type="button" onClick={() => window.location.reload()}>Reload the puzzle <span aria-hidden="true">↗</span></button></main>
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(<StrictMode><AppErrorBoundary><App /></AppErrorBoundary></StrictMode>)
