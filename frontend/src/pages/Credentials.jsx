import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Key, 
  Share2, 
  RefreshCw, 
  AlertCircle,
  Clock,
  Globe,
  User,
  Lock,
  Eye,
  X
} from 'lucide-react'
import { getCredentials, viewSharedCredential } from '../services/api'
import SharePassword from '../components/SharePassword'
import toast from 'react-hot-toast'

const Credentials = () => {
  const [credentials, setCredentials] = useState([])
  const [loading, setLoading] = useState(true)
  const [shareModal, setShareModal] = useState(null) // { credentialId, website }
  const [viewModal, setViewModal] = useState(null) // { credentialId, website } for shared credentials
  const [sharePassword, setSharePassword] = useState('')
  const [viewing, setViewing] = useState(false)
  const [decryptedCredentials, setDecryptedCredentials] = useState({}) // Store decrypted shared credentials
  const navigate = useNavigate()

  const fetchCredentials = async () => {
    setLoading(true)
    try {
      const result = await getCredentials()
      console.log('Credentials API response:', result)
      
      if (result && result.success) {
        setCredentials(result.credentials || [])
        // Never show error toast for successful responses, even if empty
        console.log('Successfully fetched credentials:', result.credentials?.length || 0, 'items')
      } else {
        // Only show error if result exists and has an error
        const errorMsg = result?.error || result?.message || 'Failed to fetch credentials'
        console.error('Credentials fetch failed:', errorMsg)
        // Don't show toast for empty credentials - that's expected
        if (errorMsg && !errorMsg.toLowerCase().includes('empty') && !errorMsg.toLowerCase().includes('no credentials')) {
          toast.error(errorMsg)
        }
        setCredentials([])
      }
    } catch (error) {
      console.error('Error fetching credentials:', error)
      console.error('Error response:', error.response?.data)
      
      // Check if it's a 401 (unauthorized) - redirect will handle it
      if (error.response?.status === 401) {
        navigate('/')
        return
      }
      
      // Only show error if it's a real error, not a successful empty response
      const errorData = error.response?.data
      if (errorData && !errorData.success) {
        const errorMsg = errorData.error || errorData.message || error.message || 'Failed to load credentials'
        // Don't show error for empty results
        if (!errorMsg.toLowerCase().includes('empty') && !errorMsg.toLowerCase().includes('no credentials')) {
          toast.error(errorMsg)
        }
      } else if (!error.response) {
        // Network error or other non-HTTP error
        toast.error('Network error. Please check your connection.')
      }
      
      setCredentials([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken')
    if (!token) {
      toast.error('Please log in to view your credentials')
      setLoading(false)
      // Redirect to home page
      navigate('/')
      return
    }
    fetchCredentials()
  }, [navigate])

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const handleShareSuccess = () => {
    // Optionally refresh credentials after sharing
    // fetchCredentials()
  }

  const handleViewSharedCredential = async () => {
    if (!viewModal || !sharePassword.trim()) {
      toast.error('Please enter the share password')
      return
    }

    setViewing(true)
    try {
      const result = await viewSharedCredential(viewModal.credentialId, sharePassword.trim())
      
      if (result.success && result.credential) {
        // Store decrypted credential
        setDecryptedCredentials(prev => ({
          ...prev,
          [viewModal.credentialId]: result.credential
        }))
        
        // Update the credential in the list
        setCredentials(prev => prev.map(c => 
          c.id === viewModal.credentialId 
            ? { ...c, ...result.credential, requires_password: false }
            : c
        ))
        
        toast.success('Credential decrypted successfully!')
        setViewModal(null)
        setSharePassword('')
      } else {
        toast.error(result.error || 'Failed to decrypt credential')
      }
    } catch (error) {
      console.error('Error viewing shared credential:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Failed to decrypt credential'
      toast.error(errorMsg)
    } finally {
      setViewing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading credentials...</span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Key className="h-8 w-8 mr-3 text-primary-600" />
              My Credentials
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and share your saved credentials securely
            </p>
          </div>
          <button
            onClick={fetchCredentials}
            className="btn-secondary flex items-center"
            title="Refresh credentials"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Credentials List */}
        {credentials.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Key className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No credentials found</h3>
            <p className="text-gray-600 mb-6">
              You don't have any saved credentials yet.
            </p>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>Credentials will appear here once you save them</span>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Website
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {credentials.map((credential) => {
                    const isShared = credential.is_shared || false
                    const requiresPassword = credential.requires_password || false
                    const isDecrypted = decryptedCredentials[credential.id] || !requiresPassword
                    const displayCredential = isDecrypted && decryptedCredentials[credential.id] 
                      ? decryptedCredentials[credential.id] 
                      : credential

                    return (
                      <tr key={credential.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Globe className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {displayCredential.website || 'Unknown Website'}
                                {isShared && (
                                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                                    Shared
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 font-mono">
                                {credential.id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {isDecrypted ? (displayCredential.username || 'N/A') : '*** (Password required)'}
                            </span>
                            {requiresPassword && !isDecrypted && (
                              <Lock className="h-3 w-3 text-amber-600 ml-2" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-2" />
                            {formatDate(credential.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-2" />
                            {formatDate(credential.updated_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {requiresPassword && !isDecrypted ? (
                              <button
                                onClick={() => setViewModal({
                                  credentialId: credential.id,
                                  website: credential.website || 'Unknown Website'
                                })}
                                className="text-amber-600 hover:text-amber-900 flex items-center"
                                title="Enter password to view"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </button>
                            ) : !isShared ? (
                              <button
                                onClick={() => setShareModal({
                                  credentialId: credential.id,
                                  website: credential.website || 'Unknown Website'
                                })}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                                title="Share credential"
                              >
                                <Share2 className="h-4 w-4 mr-1" />
                                Share
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats */}
        {credentials.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Total credentials: <span className="font-semibold text-gray-900">{credentials.length}</span>
              </span>
              <span className="text-gray-500">
                Last updated: {credentials[0]?.updated_at ? formatDate(credentials[0].updated_at) : 'N/A'}
              </span>
            </div>
          </div>
        )}

        {/* Share Password Modal */}
        {shareModal && (
          <SharePassword
            credentialId={shareModal.credentialId}
            website={shareModal.website}
            onClose={() => setShareModal(null)}
            onSuccess={handleShareSuccess}
          />
        )}

        {/* View Shared Credential Modal (Password Entry) */}
        {viewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <Lock className="h-5 w-5 text-amber-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Enter Share Password</h2>
                </div>
                <button
                  onClick={() => {
                    setViewModal(null)
                    setSharePassword('')
                  }}
                  disabled={viewing}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">Website:</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">{viewModal.website}</p>
                </div>

                <div>
                  <label htmlFor="sharePasswordInput" className="block text-sm font-medium text-gray-700 mb-2">
                    Share Password *
                  </label>
                  <input
                    type="password"
                    id="sharePasswordInput"
                    value={sharePassword}
                    onChange={(e) => setSharePassword(e.target.value)}
                    placeholder="Enter the password provided by the sharer"
                    className="input"
                    disabled={viewing}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && sharePassword.trim().length >= 4) {
                        handleViewSharedCredential()
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The sharer should have provided you with a password to access this credential.
                  </p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setViewModal(null)
                      setSharePassword('')
                    }}
                    disabled={viewing}
                    className="btn-secondary flex-1 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleViewSharedCredential}
                    disabled={viewing || !sharePassword.trim() || sharePassword.trim().length < 4}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {viewing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Decrypting...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        View Credential
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

export default Credentials

