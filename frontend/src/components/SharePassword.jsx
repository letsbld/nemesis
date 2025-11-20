import { useState } from 'react'
import { Share2, X, Mail, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { sharePassword } from '../services/api'
import toast from 'react-hot-toast'

const SharePassword = ({ credentialId, website, onClose, onSuccess }) => {
  const [recipientEmails, setRecipientEmails] = useState('')
  const [durationHours, setDurationHours] = useState(24)
  const [sharePassword, setSharePassword] = useState('')
  const [sharing, setSharing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Parse email addresses (comma or newline separated)
    const emails = recipientEmails
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0)

    if (emails.length === 0) {
      toast.error('Please enter at least one recipient email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = emails.filter(email => !emailRegex.test(email))
    if (invalidEmails.length > 0) {
      toast.error(`Invalid email addresses: ${invalidEmails.join(', ')}`)
      return
    }

    if (!credentialId) {
      toast.error('Credential ID is required')
      return
    }

    if (durationHours < 0) {
      toast.error('Duration must be a positive number')
      return
    }

    if (!sharePassword || sharePassword.trim().length < 4) {
      toast.error('Share password is required and must be at least 4 characters')
      return
    }

    setSharing(true)

    try {
      const result = await sharePassword(credentialId, emails, durationHours, sharePassword.trim())
      
      if (result.message) {
        toast.success(result.message)
      } else {
        toast.success(`Credential shared successfully with ${emails.length} recipient(s)`)
      }

      // Reset form
      setRecipientEmails('')
      setDurationHours(24)
      setSharePassword('')

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result)
      }

      // Close modal if onClose is provided
      if (onClose) {
        onClose()
      }
    } catch (error) {
      console.error('Share password error:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to share credential'
      toast.error(errorMessage)
    } finally {
      setSharing(false)
    }
  }

  const handleClose = () => {
    if (!sharing && onClose) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Share2 className="h-5 w-5 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Share Credential</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={sharing}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Website Info */}
          {website && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">Website:</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">{website}</p>
            </div>
          )}

          {/* Recipient Emails */}
          <div>
            <label htmlFor="recipientEmails" className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline h-4 w-4 mr-1" />
              Recipient Email Addresses *
            </label>
            <textarea
              id="recipientEmails"
              value={recipientEmails}
              onChange={(e) => setRecipientEmails(e.target.value)}
              placeholder="Enter email addresses separated by commas or new lines&#10;Example: user1@example.com, user2@example.com"
              className="input min-h-[100px] resize-y"
              required
              disabled={sharing}
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple emails with commas or new lines
            </p>
          </div>

          {/* Share Password - REQUIRED for security */}
          <div>
            <label htmlFor="sharePassword" className="block text-sm font-medium text-gray-700 mb-2">
              <AlertCircle className="inline h-4 w-4 mr-1 text-amber-600" />
              Share Password * (Recipients need this to access)
            </label>
            <input
              type="password"
              id="sharePassword"
              value={sharePassword}
              onChange={(e) => setSharePassword(e.target.value)}
              placeholder="Enter password for recipients to access this credential"
              className="input"
              required
              disabled={sharing}
              minLength={4}
            />
            <p className="text-xs text-amber-600 mt-1">
              ⚠️ Recipients will need this password to decrypt and view the shared credential. Share it securely!
            </p>
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="durationHours" className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Share Duration (Hours) *
            </label>
            <input
              type="number"
              id="durationHours"
              value={durationHours}
              onChange={(e) => setDurationHours(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.1"
              className="input"
              required
              disabled={sharing}
            />
            <p className="text-xs text-gray-500 mt-1">
              {durationHours === 0 
                ? 'No expiration (shared indefinitely)' 
                : durationHours === 1 
                ? 'Expires in 1 hour'
                : `Expires in ${durationHours} hours (${(durationHours / 24).toFixed(1)} days)`
              }
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-gray-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-600">
                <p className="font-medium mb-1">Note:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Recipients must have an account with a matching company email</li>
                  <li>You cannot share credentials with yourself</li>
                  <li>Recipients will need the share password to decrypt and view the credential</li>
                  <li>The share will expire after the specified duration</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={sharing}
              className="btn-secondary flex-1 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sharing || !recipientEmails.trim() || durationHours < 0 || !sharePassword.trim() || sharePassword.trim().length < 4}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {sharing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sharing...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Credential
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SharePassword

