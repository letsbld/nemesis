import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  File, 
  Trash2, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'
import { checkAdmin } from '../services/api'

const Manage = () => {
  const navigate = useNavigate()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [fileFilter, setFileFilter] = useState('all') // 'all', 'active', 'expired'
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminCheckLoading, setAdminCheckLoading] = useState(true)

  // Check if user is admin on mount using API
  // This works with both JWT tokens and proxy headers (X-User-*)
  useEffect(() => {
    const verifyAdminStatus = async () => {
      try {
        const result = await checkAdmin()
        
        if (result.success && result.isAdmin) {
          setIsAdmin(true)
        } else {
          // Not an admin - show error and redirect to home
          if (result.authenticated) {
            toast.error('Admin access required. Only users in the admins table can access this page.')
          } else {
            toast.error('Authentication required. Please log in as an admin.')
          }
          navigate('/')
          return
        }
      } catch (error) {
        console.error('Error verifying admin status:', error)
        toast.error('Failed to verify admin status. Please try again.')
        navigate('/')
        return
      } finally {
        setAdminCheckLoading(false)
      }
    }

    verifyAdminStatus()
  }, [navigate])

  const fetchData = async () => {
    if (!isAdmin) return
    
    setLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      const filesResponse = await fetch('/api/files/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // Check if response is ok before parsing
      let filesData = { success: false, files: [] }

      try {
        if (filesResponse.ok) {
          filesData = await filesResponse.json()
        } else {
          // Try to parse error response
          try {
            filesData = await filesResponse.json()
          } catch {
            filesData = {
              success: false,
              error: `Server error: ${filesResponse.status} ${filesResponse.statusText}`,
              files: []
            }
          }
        }
      } catch (error) {
        console.error('[MANAGE] Error parsing files response:', error)
        filesData = {
          success: false,
          error: 'Failed to parse response',
          files: []
        }
      }

      console.log('[MANAGE] Files response:', filesData)

      // Check for 403 Forbidden (not admin)
      if (filesResponse.status === 403) {
        toast.error('Admin access required. You must be in the admins table to access this page.')
        navigate('/')
        return
      }

      // Check for 401 Unauthorized (not authenticated)
      if (filesResponse.status === 401) {
        toast.error('Authentication required. Please log in as an admin.')
        navigate('/')
        return
      }

      // Always set files array, even if empty
      if (filesData.success && Array.isArray(filesData.files)) {
        setFiles(filesData.files)
      } else {
        console.error('[MANAGE] Files API error:', filesData.error)
        if (filesData.error) {
          toast.error(`Failed to load files: ${filesData.error}`)
        }
        setFiles([]) // Ensure it's always an array
      }
    } catch (error) {
      console.error('[MANAGE] Error fetching data:', error)
      toast.error('Failed to load data. Please check the console for details.')
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin && !adminCheckLoading) {
      fetchData()
    }
  }, [isAdmin, adminCheckLoading])

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.success) {
        toast.success('File deleted successfully')
        fetchData()
      } else {
        toast.error(result.error || 'Failed to delete file')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete file')
    }
  }

  const handleRunCleanup = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/files/cleanup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Cleanup completed: ${result.result.filesDeleted} files, ${result.result.credentialsDeleted} credentials deleted`)
        fetchData()
      } else {
        toast.error(result.error || 'Cleanup failed')
      }
    } catch (error) {
      console.error('Cleanup error:', error)
      toast.error('Cleanup failed')
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

  const getStatusIcon = (isExpired) => {
    return isExpired ? (
      <AlertCircle className="h-4 w-4 text-red-500" />
    ) : (
      <CheckCircle className="h-4 w-4 text-green-500" />
    )
  }

  const getStatusText = (isExpired) => {
    return isExpired ? 'Expired' : 'Active'
  }

  const getStatusColor = (isExpired) => {
    return isExpired ? 'text-red-600' : 'text-green-600'
  }

  // Show loading while checking admin status
  if (adminCheckLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // Don't render if not admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin access required. Only users in the admins table can access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Manage Files</h1>
        <div className="flex space-x-2">
          <button
            onClick={fetchData}
            className="btn-secondary"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleRunCleanup}
            className="btn-warning"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Run Cleanup
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setFileFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                fileFilter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({files.length})
            </button>
            <button
              onClick={() => setFileFilter('active')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                fileFilter === 'active'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({files.filter(f => !f.isExpired).length})
            </button>
            <button
              onClick={() => setFileFilter('expired')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                fileFilter === 'expired'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Expired ({files.filter(f => f.isExpired).length})
            </button>
          </div>
        </div>

      {/* Files Table */}
      <div className="bg-white shadow rounded-lg">
          {(() => {
            const filteredFiles = files.filter((file) => {
              if (fileFilter === 'all') return true
              if (fileFilter === 'active') return !file.isExpired
              if (fileFilter === 'expired') return file.isExpired
              return true
            })
            
            return filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <File className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {fileFilter === 'all' ? 'No files' : fileFilter === 'active' ? 'No active files' : 'No expired files'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {fileFilter === 'all' 
                    ? 'No files have been uploaded yet.' 
                    : fileFilter === 'active'
                    ? 'No active files found. Try selecting a different filter.'
                    : 'No expired files found. Try selecting a different filter.'}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uploaded
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expires
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFiles.map((file) => (
                    <tr key={file.fileId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <File className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {file.originalFilename}
                            </div>
                            <div className="text-sm text-gray-500">
                              {file.fileId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(file.fileSize)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(file.uploadTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(file.expiryTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(file.isExpired)}
                          <span className={`ml-2 text-sm font-medium ${getStatusColor(file.isExpired)}`}>
                            {getStatusText(file.isExpired)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteFile(file.fileId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )
          })()}
        </div>
    </div>
  )
}

export default Manage
