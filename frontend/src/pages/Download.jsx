import { useState, useEffect } from 'react'
import FileDownload from '../components/FileDownload'

const Download = () => {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Reset error state on mount
    setHasError(false)
    
    // Catch any unhandled errors
    const handleError = (error) => {
      console.error('Error in Download page:', error)
      setHasError(true)
    }
    
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleError)
    
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleError)
    }
  }, [])

  if (hasError) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-900 mb-2">Something went wrong</h2>
          <p className="text-red-700 mb-4">Please refresh the page and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Download File</h1>
        <p className="text-lg text-gray-600">
          Enter the share code provided by the sender to download their file securely
        </p>
      </div>
      
      <FileDownload />
    </div>
  )
}

export default Download
