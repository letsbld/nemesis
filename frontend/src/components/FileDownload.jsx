import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Download, File, AlertCircle, CheckCircle, Key } from 'lucide-react'
import toast from 'react-hot-toast'

const FileDownload = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [shareCode, setShareCode] = useState('')
  const [password, setPassword] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [fileInfo, setFileInfo] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const fetchingRef = useRef(false) // Prevent duplicate API calls

  // Handle paste event to detect share code + password
  const handlePaste = async (e, fieldType) => {
    try {
      // Get pasted text from clipboard data (more reliable than async clipboard API)
      const pastedText = e.clipboardData.getData('text') || await navigator.clipboard.readText().catch(() => '')
      
      if (!pastedText) return
      
      // Try to parse share code and password from pasted text
      // Formats: "ABC123\nPassword123", "ABC123 Password123", "Share Code: ABC123\nPassword: Password123"
      const lines = pastedText.split(/\n|\r\n/).map(line => line.trim()).filter(line => line)
      
      if (lines.length >= 2) {
        // Check if it looks like share code + password format
        let code = null
        let pass = null
        
        // Special case: If exactly 2 lines and first line matches share code pattern, 
        // treat second line as password (most common format from copy)
        if (lines.length === 2) {
          const firstLine = lines[0].trim()
          const secondLine = lines[1].trim()
          
          // Check if first line is a share code (6-12 alphanumeric chars)
          if (firstLine.match(/^[A-Z0-9]{6,12}$/i)) {
            code = firstLine.toUpperCase()
            // Second line is the password (can be any text)
            pass = secondLine
          }
        }
        
        // If we didn't find both in the simple 2-line case, try more complex parsing
        if (!code || !pass) {
          // Try different parsing patterns
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            
            // Pattern: "Share Code: ABC123" or just "ABC123" (6-12 chars, alphanumeric)
            if (line.match(/^[A-Z0-9]{6,12}$/i) && !code) {
              code = line.toUpperCase()
            }
            // Pattern: "Share Code: ABC123" - extract code
            else if (line.toLowerCase().includes('share') && line.toLowerCase().includes('code')) {
              const codeMatch = line.match(/code[:\s]+([A-Z0-9]{6,12})/i)
              if (codeMatch) {
                code = codeMatch[1].toUpperCase()
              }
            }
            // Pattern: "Password: xyz" - extract password
            else if (line.toLowerCase().includes('password')) {
              const passMatch = line.match(/password[:\s]+(.+)/i)
              if (passMatch) {
                pass = passMatch[1].trim()
              }
            }
          }
          
          // If we found code but not password, check next line after code
          if (code && !pass && lines.length > 1) {
            const codeIndex = lines.findIndex(l => l === code || l.toUpperCase() === code || l.trim() === code)
            if (codeIndex >= 0 && codeIndex < lines.length - 1) {
              // Next line might be the password
              const nextLine = lines[codeIndex + 1].trim()
              // If it doesn't look like another code, treat it as password
              if (!nextLine.match(/^[A-Z0-9]{6,12}$/i)) {
                pass = nextLine
              }
            }
          }
        }
        
        // If we have both, set them
        if (code && pass) {
          e.preventDefault() // Prevent default paste
          setShareCode(code)
          setPassword(pass)
          toast.success('Share code and password pasted!')
          
          // Auto-fetch file info
          setTimeout(() => {
            handleGetInfo(code)
          }, 100)
          return true
        }
        // If only code found, set it
        else if (code && fieldType === 'code') {
          e.preventDefault()
          setShareCode(code)
          toast.success('Share code pasted!')
          return true
        }
      }
      // Single line - check if it's a share code format
      else if (lines.length === 1 && fieldType === 'code') {
        const text = lines[0].trim()
        if (text.match(/^[A-Z0-9]{6,12}$/i)) {
          e.preventDefault()
          setShareCode(text.toUpperCase())
          toast.success('Share code pasted!')
          return true
        }
      }
    } catch (error) {
      // Clipboard API might not be available, ignore
      console.log('Paste detection failed:', error)
    }
    return false
  }

  // Read share code and password from URL parameters on mount
  useEffect(() => {
    try {
      const codeFromUrl = searchParams?.get('code')
      const passwordFromUrl = searchParams?.get('password')
      
      if (codeFromUrl) {
        const upperCode = String(codeFromUrl).toUpperCase().trim()
        if (upperCode) {
          setShareCode(upperCode)
          
          // Set password from URL if provided
          if (passwordFromUrl) {
            setPassword(String(passwordFromUrl).trim())
          }
          
          // Automatically get file info if code is provided in URL
          const fetchInfo = async () => {
            // Prevent duplicate calls
            if (fetchingRef.current) {
              return
            }
            
            fetchingRef.current = true
            try {
              // Use the normalized code directly, ensure it's a string
              const code = String(upperCode).trim().toUpperCase()
              if (!code || typeof code !== 'string') {
                console.error('[FETCH-INFO] Invalid code:', code, typeof code)
                return
              }

              const url = `/api/files/info/${encodeURIComponent(code)}`
              console.log('[FETCH-INFO] Fetching:', url)
              
              const response = await fetch(url, {
                headers: {
                  'Content-Type': 'application/json'
                }
              })
              
              if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to fetch file info' }))
                setFileInfo(null)
                toast.error(errorData.error || 'Invalid share code', { id: `fetch-error-${code}` })
                return
              }

              const result = await response.json()

              if (result.success) {
                setFileInfo(result.fileInfo)
                toast.success('File information retrieved', { id: `fetch-success-${code}` })
              } else {
                setFileInfo(null)
                toast.error(result.error || 'Invalid share code', { id: `fetch-error-${code}` })
              }
            } catch (error) {
              console.error('[FETCH-INFO] Get info error:', error)
              setFileInfo(null)
              if (error.name === 'TypeError' && error.message.includes('fetch')) {
                toast.error('Network error: Could not connect to server. Please check if the server is running.', { id: 'network-error' })
              } else {
                toast.error('Failed to get file information', { id: 'fetch-error' })
              }
            } finally {
              fetchingRef.current = false
            }
          }
          // Small delay to ensure state is set
          setTimeout(fetchInfo, 100)
        }
      }
    } catch (error) {
      console.error('Error in useEffect for URL code:', error)
      // Don't crash the component, just log the error
    }
  }, [searchParams])

  // No authentication required - removed login check

  const handleGetInfo = async (codeToUse = null) => {
    const code = String(codeToUse || shareCode || '').trim().toUpperCase()
    if (!code) {
      toast.error('Please enter a share code', { id: 'no-code-error' })
      return
    }

    // Prevent duplicate calls
    if (fetchingRef.current) {
      return
    }
    
    fetchingRef.current = true

    // No authentication required
    try {
      const response = await fetch(`/api/files/info/${encodeURIComponent(code)}`, {
        headers: {
          // No Authorization header needed
        }
      })
      const result = await response.json()

      if (result.success) {
        setFileInfo(result.fileInfo)
        toast.success('File information retrieved', { id: `info-success-${code}` })
      } else {
        setFileInfo(null)
        toast.error(result.error || 'Invalid share code', { id: `info-error-${code}` })
      }
    } catch (error) {
      console.error('Get info error:', error)
      
      // Handle network errors specifically
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Network error: Could not connect to server. Please check if the server is running.', { id: 'network-error' })
      } else {
        toast.error('Failed to get file information', { id: 'fetch-error' })
      }
    } finally {
      fetchingRef.current = false
    }
  }

  const handleDownload = async () => {
    // Ensure shareCode is always a string
    const code = String(shareCode || '').trim().toUpperCase()
    if (!code || typeof code !== 'string') {
      console.error('[DOWNLOAD] Invalid shareCode:', shareCode, typeof shareCode)
      toast.error('Please enter a valid share code')
      return
    }


    setDownloading(true)

    // No authentication required
    try {
      // Password is required
      if (!password.trim()) {
        toast.error('Password is required to download this file')
        return
      }

      console.log('[DOWNLOAD] Starting download request...', { 
        shareCode: code, 
        hasFileInfo: !!fileInfo,
        hasPassword: !!password
      })
      
      const response = await fetch('/api/files/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // No Authorization header needed
        },
        body: JSON.stringify({
          shareCode: code,
          password: password.trim(),
        }),
      })

      console.log('[DOWNLOAD] Response received:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        contentDisposition: response.headers.get('content-disposition'),
        contentLength: response.headers.get('content-length'),
        ok: response.ok
      })

      // Check for error status codes first
      if (!response.ok) {
        // Clone response to read it without consuming the original
        const clonedResponse = response.clone()
        let errorData;
        try {
          const contentType = response.headers.get('content-type')
          console.log('[DOWNLOAD] Error response, content-type:', contentType)
          
          if (contentType && contentType.includes('application/json')) {
            errorData = await clonedResponse.json()
            console.log('[DOWNLOAD] Error data (JSON):', errorData)
          } else {
            // Try to read as text first to see what we got
            const text = await clonedResponse.text()
            console.log('[DOWNLOAD] Error response (text):', text.substring(0, 200))
            
            // Try to parse as JSON if it looks like JSON
            try {
              errorData = JSON.parse(text)
            } catch {
              errorData = { error: text || 'Download failed' }
            }
          }
        } catch (parseError) {
          console.error('[DOWNLOAD] Error parsing error response:', parseError)
          errorData = { error: `Server error: ${response.status} ${response.statusText}` }
        }

        if (errorData.unauthorized) {
          toast.error('Access denied. You are not the authorized recipient of this file.')
        } else {
          toast.error(errorData.error || errorData.message || 'Download failed')
        }
        throw new Error(errorData.error || errorData.message || 'Download failed')
      }

      // Read response as arrayBuffer first to check if it's actually JSON
      // This allows us to inspect the content without consuming the stream
      console.log('[DOWNLOAD] Reading response as arrayBuffer...')
      const arrayBuffer = await response.arrayBuffer()
      console.log('[DOWNLOAD] ArrayBuffer received:', {
        size: arrayBuffer.byteLength,
        firstBytes: new Uint8Array(arrayBuffer).slice(0, 10)
      })

      // Check if response is actually JSON (error) by looking at first bytes
      const firstBytes = new Uint8Array(arrayBuffer).slice(0, 1)
      const startsWithBrace = firstBytes[0] === 0x7B // '{' character
      const contentType = response.headers.get('content-type')
      
      // If it starts with '{' or content-type is JSON, it's likely an error JSON
      if ((startsWithBrace || (contentType && contentType.includes('application/json'))) && arrayBuffer.byteLength < 10000) {
        // Small response that looks like JSON - try to parse it
        try {
          const text = new TextDecoder().decode(arrayBuffer)
          const result = JSON.parse(text)
          console.error('[DOWNLOAD] Got JSON response instead of file:', result)
          
          if (result.unauthorized) {
            toast.error('Access denied. You are not the authorized recipient of this file.')
          } else {
            toast.error(result.error || result.message || 'Download failed')
          }
          throw new Error(result.error || result.message || 'Download failed')
        } catch (parseError) {
          // Not JSON, continue with blob handling
          console.log('[DOWNLOAD] Not JSON, treating as binary file')
        }
      }

      // Convert arrayBuffer to blob
      const blob = new Blob([arrayBuffer], { type: response.headers.get('content-type') || 'application/octet-stream' })
      console.log('[DOWNLOAD] Blob created:', {
        size: blob.size,
        type: blob.type
      })

      // Validate blob size
      if (blob.size === 0) {
        console.error('[DOWNLOAD] Blob is empty (0 bytes)')
        toast.error('Download failed: File is empty or could not be retrieved')
        throw new Error('File is empty')
      }

      const contentDisposition = response.headers.get('content-disposition')
      let filename = 'download'
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/i)
        if (filenameMatch) {
          filename = filenameMatch[1]
          // Decode filename if it's URL encoded
          try {
            filename = decodeURIComponent(filename)
          } catch (e) {
            // If decoding fails, use the original
          }
        }
      }

      console.log('[DOWNLOAD] Triggering download:', { filename, blobSize: blob.size })

      // Create temporary link and trigger download
      try {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.style.display = 'none'
        a.setAttribute('download', filename) // Ensure download attribute is set
        
        // Append to body
        document.body.appendChild(a)
        
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          // Trigger download
          a.click()
          
          // Clean up after a delay to ensure download starts
          setTimeout(() => {
            try {
              if (document.body.contains(a)) {
                document.body.removeChild(a)
              }
              window.URL.revokeObjectURL(url)
              console.log('[DOWNLOAD] Cleanup completed')
            } catch (cleanupError) {
              console.error('[DOWNLOAD] Cleanup error:', cleanupError)
            }
          }, 200)
        })

        toast.success('File downloaded successfully!')
      } catch (downloadError) {
        console.error('[DOWNLOAD] Error triggering download:', downloadError)
        
        // Fallback: Try opening in new window
        try {
          const url = window.URL.createObjectURL(blob)
          window.open(url, '_blank')
          toast.success('File opened in new window. Please save it manually.')
        } catch (fallbackError) {
          console.error('[DOWNLOAD] Fallback also failed:', fallbackError)
          throw new Error('Failed to trigger download. Please check browser settings.')
        }
      }
      
      // Clear form
      setShareCode('')
      setPassword('')
      setFileInfo(null)
    } catch (error) {
      console.error('[DOWNLOAD] Download error:', error)
      console.error('[DOWNLOAD] Error stack:', error.stack)
      
      // Handle network errors specifically
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Network error: Could not connect to server. Please check if the server is running.')
      } else if (error.message) {
        toast.error(error.message || 'Download failed')
      } else {
        toast.error('Download failed. Please try again.')
      }
    } finally {
      setDownloading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown'
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleString()
  }

  const isExpired = fileInfo?.expiryTime && new Date() > new Date(fileInfo.expiryTime)

  return (
    <div className="space-y-6">
      {/* Share Code Input */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Download File</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Code
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={shareCode}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().trim();
                  // Only allow alphanumeric characters, max 12 chars
                  const cleaned = value.replace(/[^A-Z0-9]/g, '').substring(0, 12);
                  setShareCode(cleaned);
                }}
                onPaste={async (e) => {
                  // Use the new paste handler that detects both code and password
                  const handled = await handlePaste(e, 'code');
                  
                  // Fallback: if handlePaste didn't handle it, do basic parsing
                  if (!handled && !e.defaultPrevented) {
                    const pastedText = e.clipboardData.getData('text');
                    // Extract share code from pasted text (look for 6-12 alphanumeric chars)
                    const match = pastedText.match(/[A-Z0-9]{6,12}/i);
                    if (match) {
                      e.preventDefault();
                      setShareCode(match[0].toUpperCase());
                      toast.success('Share code pasted!');
                    } else {
                      // If no match, try to clean the pasted text
                      const cleaned = pastedText.replace(/[^A-Z0-9]/gi, '').substring(0, 12).toUpperCase();
                      if (cleaned.length >= 6) {
                        e.preventDefault();
                        setShareCode(cleaned);
                        toast.success('Share code pasted!');
                      }
                    }
                  }
                }}
                placeholder="Paste share code (or code + password together)"
                className="input flex-1"
                maxLength={12}
              />
              <button
                onClick={handleGetInfo}
                disabled={!shareCode.trim()}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Get Info
              </button>
            </div>
          </div>

          {fileInfo && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start">
                {isExpired ? (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{fileInfo.originalFilename}</h4>
                  <div className="mt-2 text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                      <File className="h-4 w-4 mr-1" />
                      Size: {formatFileSize(fileInfo.fileSize)}
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">📅</span>
                      Uploaded: {formatDate(fileInfo.uploadTime)}
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">⏰</span>
                      Expires: {formatDate(fileInfo.expiryTime)}
                    </div>
                    {fileInfo.downloadsRemaining !== null && (
                      <div className="flex items-center">
                        <span className="mr-1">📥</span>
                        Downloads remaining: {fileInfo.downloadsRemaining}
                      </div>
                    )}
                    {isExpired && (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        File has expired
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Password field - required for download */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Key className="inline h-4 w-4 mr-1" />
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter the password provided by the sender (or paste code+password in share code field)"
                className="input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              The password is required along with the share code to download the file.
            </p>
          </div>

          <button
            onClick={handleDownload}
            disabled={!shareCode.trim() || !password.trim() || downloading || isExpired}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            title={!password.trim() ? 'Password is required' : ''}
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download File
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">How to download:</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Enter the share code provided by the sender</li>
          <li>Enter the password provided by the sender</li>
          <li>Click "Get Info" to view file details (optional)</li>
          <li>Click "Download File" to save to your device</li>
        </ol>
      </div>
    </div>
  )
}

export default FileDownload
