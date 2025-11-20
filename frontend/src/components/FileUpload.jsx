import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, Lock, Clock, Users, X, Key, RefreshCw, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import { generatePasswordForFile } from '../utils/passwordGenerator'

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [formData, setFormData] = useState({
    expiryHours: 24, // Default to 24 hours
    maxDownloads: '',
    recipientFirstName: ''
  })
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [generatedShareCode, setGeneratedShareCode] = useState(null)

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      // Auto-generate password when file is selected
      if (!generatedPassword) {
        const passwordResult = generatePasswordForFile('strong')
        setGeneratedPassword(passwordResult.password)
      }
    }
  }, [generatedPassword])

  const handleGeneratePassword = () => {
    const passwordResult = generatePasswordForFile('strong')
    setGeneratedPassword(passwordResult.password)
    toast.success('New password generated!')
  }

  const handleCopyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword)
      toast.success('Password copied to clipboard!')
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/*': ['.pdf', '.doc', '.docx', '.txt'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'video/*': ['.mp4', '.avi', '.mov'],
      'audio/*': ['.mp3', '.wav', '.flac'],
      'text/*': ['.txt', '.csv', '.json'],
      'application/zip': ['.zip', '.rar'],
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      if (!formData.recipientFirstName || !formData.recipientFirstName.trim()) {
        toast.error('Please enter recipient first name')
        return
      }

      // Password is required - must be generated
      if (!generatedPassword) {
        toast.error('Please generate a password first')
        return
      }

      const options = {
        expiryHours: parseFloat(formData.expiryHours), // Use parseFloat to support fractional hours (minutes)
        maxDownloads: formData.maxDownloads ? parseInt(formData.maxDownloads) : null,
        recipientFirstName: formData.recipientFirstName.trim(),
        password: generatedPassword.trim(),
        onProgress: (progress) => {
          setUploadProgress(progress)
        }
      }

      // No authentication required - removed login check
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          // No Authorization header needed
        },
        body: (() => {
          const uploadFormData = new FormData()
          uploadFormData.append('file', file)
          if (options.expiryHours) uploadFormData.append('expiryHours', options.expiryHours)
          if (options.maxDownloads && options.maxDownloads > 0) uploadFormData.append('maxDownloads', options.maxDownloads)
          uploadFormData.append('recipientFirstName', options.recipientFirstName)
          uploadFormData.append('password', options.password)
          return uploadFormData
        })()
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle HTTP error status codes
        if (response.status === 400) {
          // Validation errors or business logic errors (like self-sharing)
          toast.error(result.error || 'Invalid request. Please check your input.')
          if (result.details && Array.isArray(result.details)) {
            // Show validation details if available
            result.details.forEach(detail => {
              toast.error(detail.msg || detail.message || detail)
            })
          }
        } else if (response.status === 403) {
          toast.error(result.error || 'Access denied. You do not have permission.')
        } else if (response.status === 404) {
          toast.error(result.error || 'Recipient not found. Please check the name.')
        } else if (response.status === 500) {
          // Database error - show detailed message
          const errorMsg = result.message || result.error || 'Server error. Please try again later.'
          toast.error(errorMsg)
          if (result.shareCode) {
            console.error('Upload failed for share code:', result.shareCode)
            console.error('Error details:', result.details)
          }
        } else {
          toast.error(result.error || 'Upload failed')
        }
        return
      }

      if (result.success) {
        // Store share code and password
        setGeneratedShareCode(result.shareCode)
        if (result.password) {
          setGeneratedPassword(result.password)
        }
        toast.success('File uploaded and shared successfully!')
        // Pass result with password to parent component
        onUploadSuccess?.({
          ...result,
          password: result.password || generatedPassword // Include password in callback
        })
        setFile(null)
        setFormData({
          expiryHours: 24, // Default to 24 hours
          maxDownloads: '',
          recipientFirstName: ''
        })
        setGeneratedPassword('')
        setUploadProgress(0)
      } else {
        toast.error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      if (error.response) {
        // Axios error with response
        const errorData = error.response.data
        toast.error(errorData?.error || 'Upload failed. Please try again.')
      } else {
        toast.error('Network error. Please check your connection and try again.')
      }
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setUploadProgress(0)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* File Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <p className="text-lg font-medium text-gray-900">
            {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            or click to select a file
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Maximum file size: 100MB
          </p>
        </div>
      </div>

      {/* Selected File */}
      {file && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <File className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Uploading...</span>
            </div>
            <span className="text-sm font-semibold text-primary-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className="bg-primary-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Encrypting and uploading file...</span>
            <span>{uploadProgress < 100 ? 'Please wait' : 'Almost done!'}</span>
          </div>
        </div>
      )}

      {/* Upload Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Upload Options</h3>
        
        {/* Expiry Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline h-4 w-4 mr-1" />
            Expiry Time
          </label>
          <select
            name="expiryHours"
            value={formData.expiryHours}
            onChange={handleInputChange}
            className="input"
          >
            <option value={5/60}>5 minutes</option>
            <option value={10/60}>10 minutes</option>
            <option value={15/60}>15 minutes</option>
            <option value={30/60}>30 minutes</option>
            <option value={1}>1 hour</option>
            <option value={6}>6 hours</option>
            <option value={12}>12 hours</option>
            <option value={24}>24 hours</option>
            <option value={48}>48 hours</option>
            <option value={72}>72 hours</option>
            <option value={168}>7 days</option>
          </select>
        </div>

        {/* Max Downloads */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="inline h-4 w-4 mr-1" />
            Maximum Downloads (optional)
          </label>
          <input
            type="number"
            name="maxDownloads"
            value={formData.maxDownloads}
            onChange={handleInputChange}
            placeholder="Leave empty for unlimited"
            min="1"
            className="input"
          />
        </div>

        {/* Recipient First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="inline h-4 w-4 mr-1" />
            Recipient Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="recipientFirstName"
            value={formData.recipientFirstName}
            onChange={handleInputChange}
            placeholder="Enter recipient's first name (as registered)"
            className="input"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the recipient's first name exactly as it appears in the system. The recipient must be registered to receive files.
          </p>
          <p className="text-xs text-amber-600 mt-1">
            ⚠️ You cannot share a file with yourself.
          </p>
        </div>

        {/* Password Generator */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Key className="inline h-4 w-4 mr-1" />
            Download Password <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={generatedPassword}
              readOnly
              placeholder="Click 'Generate' to create a password"
              className="input flex-1 font-mono"
            />
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="btn-secondary"
              title="Generate new password"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleCopyPassword}
              disabled={!generatedPassword}
              className="btn-secondary"
              title="Copy password"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            A password will be auto-generated when you select a file. Recipients need both the share code and this password to download.
          </p>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Uploading... {uploadProgress}%
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload & Share
            </>
          )}
        </button>
      </div>

      {/* Success Message with Share Code and Password (if provided) */}
      {generatedShareCode && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                ✅ File Uploaded Successfully!
              </h3>
              <p className="text-sm text-green-700 mb-4">
                Share these details with the recipient:
              </p>
              
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Share Code
                  </label>
                  <div className="mt-1 flex items-center justify-between">
                    <code 
                      className="text-lg font-mono font-bold text-gray-900 cursor-pointer select-all"
                      onClick={async () => {
                        // When share code is clicked, copy both share code and password
                        const textToCopy = generatedPassword 
                          ? `${generatedShareCode}\n${generatedPassword}`
                          : generatedShareCode
                        try {
                          await navigator.clipboard.writeText(textToCopy)
                          toast.success(generatedPassword ? 'Share code and password copied!' : 'Share code copied!')
                        } catch (error) {
                          console.error('Failed to copy:', error)
                          toast.error('Failed to copy to clipboard')
                        }
                      }}
                      title="Click to copy share code and password"
                    >
                      {generatedShareCode}
                    </code>
                    <button
                      onClick={async () => {
                        // Copy both share code and password together
                        const textToCopy = generatedPassword 
                          ? `${generatedShareCode}\n${generatedPassword}`
                          : generatedShareCode
                        try {
                          await navigator.clipboard.writeText(textToCopy)
                          toast.success(generatedPassword ? 'Share code and password copied!' : 'Share code copied!')
                        } catch (error) {
                          console.error('Failed to copy:', error)
                          toast.error('Failed to copy to clipboard')
                        }
                      }}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Password Display */}
                {generatedPassword && (
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Password
                    </label>
                    <div className="mt-1 flex items-center justify-between">
                      <code 
                        className="text-lg font-mono font-bold text-gray-900 cursor-pointer select-all"
                        onClick={async () => {
                          // When password is clicked, copy both share code and password
                          const textToCopy = `${generatedShareCode}\n${generatedPassword}`
                          try {
                            await navigator.clipboard.writeText(textToCopy)
                            toast.success('Share code and password copied!')
                          } catch (error) {
                            console.error('Failed to copy:', error)
                            toast.error('Failed to copy to clipboard')
                          }
                        }}
                        title="Click to copy share code and password"
                      >
                        {generatedPassword}
                      </code>
                      <button
                        onClick={async () => {
                          // Copy both share code and password together
                          const textToCopy = `${generatedShareCode}\n${generatedPassword}`
                          try {
                            await navigator.clipboard.writeText(textToCopy)
                            toast.success('Share code and password copied!')
                          } catch (error) {
                            console.error('Failed to copy:', error)
                            toast.error('Failed to copy to clipboard')
                          }
                        }}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Copy Both
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Recipients need both the share code and password to download the file.
                    </p>
                  </div>
                )}

              </div>

              <div className="mt-4 pt-4 border-t border-green-200">
                <button
                  onClick={() => {
                    setGeneratedShareCode(null)
                    setGeneratedPassword('')
                  }}
                  className="text-sm text-green-700 hover:text-green-800 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload
