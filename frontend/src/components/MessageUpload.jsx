import { useState, useEffect } from 'react'
import { MessageSquare, Send, Lock, Clock, Sparkles, Copy, Eye, EyeOff } from 'lucide-react'
import { uploadMessage } from '../services/api'
import toast from 'react-hot-toast'
import { generatePasswordForFile } from '../utils/passwordGenerator'

const MessageUpload = ({ onUploadSuccess }) => {
  const [message, setMessage] = useState('')
  const [filename, setFilename] = useState('message.txt')
  const [expiryHours, setExpiryHours] = useState(24)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Auto-generate password on component mount
  useEffect(() => {
    const generated = generatePasswordForFile('strong')
    setPassword(generated.password)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!message.trim()) {
      toast.error('Please enter a message')
      return
    }

    if (!password || password.trim().length < 4) {
      toast.error('Password is required and must be at least 4 characters')
      return
    }

    setUploading(true)
    
    try {
      const result = await uploadMessage({
        message: message.trim(),
        filename: filename.trim() || 'message.txt',
        expiryHours: parseFloat(expiryHours),
        password: password.trim()
      })

      if (result.success) {
        toast.success('Message uploaded successfully!')
        // Include password in result so it can be displayed/shared
        const resultWithPassword = { ...result, password: password.trim() }
        onUploadSuccess(resultWithPassword)
      } else {
        toast.error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleClear = () => {
    setMessage('')
    setFilename('message.txt')
    setExpiryHours(24)
    setPassword('')
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <MessageSquare className="mx-auto h-12 w-12 text-blue-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Message</h2>
        <p className="text-gray-600">
          Share a text message securely with encryption
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Message Content */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message Content *
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message here..."
            className="input min-h-[120px] resize-y"
            required
            disabled={uploading}
          />
          <p className="text-sm text-gray-500 mt-1">
            {message.length} characters
          </p>
        </div>

        {/* Filename */}
        <div>
          <label htmlFor="filename" className="block text-sm font-medium text-gray-700 mb-2">
            Filename
          </label>
          <input
            type="text"
            id="filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="message.txt"
            className="input"
            disabled={uploading}
          />
        </div>

        {/* Security Options */}
        <div>
          {/* Expiry Time */}
          <div>
            <label htmlFor="expiryHours" className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4 inline mr-1" />
              Expiry Time (hours)
            </label>
            <select
              id="expiryHours"
              value={expiryHours}
              onChange={(e) => setExpiryHours(e.target.value)}
              className="input"
              disabled={uploading}
            >
              <option value={0.167}>10 minutes</option>
              <option value={0.5}>30 minutes</option>
              <option value={1}>1 hour</option>
              <option value={6}>6 hours</option>
              <option value={12}>12 hours</option>
              <option value={24}>24 hours</option>
              <option value={72}>3 days</option>
              <option value={168}>7 days</option>
            </select>
          </div>
        </div>

        {/* Password - Auto-generated */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              <Lock className="h-4 w-4 inline mr-1" />
              Password Protection <span className="text-green-600">(Auto-generated)</span>
            </label>
            <button
              type="button"
              onClick={() => {
                const generated = generatePasswordForFile('strong')
                setPassword(generated.password)
                toast.success('New password generated!')
              }}
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Regenerate
            </button>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                readOnly
                className="input pr-10 font-mono bg-gray-50 cursor-not-allowed"
                disabled={uploading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={uploading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(password)
                toast.success('Password copied to clipboard!')
              }}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              disabled={uploading}
              title="Copy password"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            A strong password has been automatically generated. Recipients will need this password to download the message.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={uploading || !message.trim() || !password || password.trim().length < 4}
            className="btn-primary flex-1 flex items-center justify-center"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Upload Message
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleClear}
            disabled={uploading}
            className="btn-secondary flex-1"
          >
            Clear Form
          </button>
        </div>
      </form>

      {/* Preview */}
      {message && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Message Preview:</h4>
          <div className="text-sm text-gray-600 whitespace-pre-wrap">
            {message}
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageUpload


