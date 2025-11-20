import { useState } from 'react'
import { Copy, Check, Share2, Clock, Users, Lock } from 'lucide-react'
import FileUpload from '../components/FileUpload'
import toast from 'react-hot-toast'

const Upload = () => {
  const [uploadResult, setUploadResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleUploadSuccess = (result) => {
    setUploadResult(result)
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  const shareViaWebAPI = async () => {
    if (!uploadResult) return

    const shareData = {
      title: 'Secure File Share',
      text: `I've shared a file with you using SecureShare. Use this code to download: ${uploadResult.shareCode}`,
      url: window.location.origin + '/download'
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        toast.success('Shared successfully!')
      } else {
        // Fallback to copying
        copyToClipboard(uploadResult.shareCode)
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error)
        copyToClipboard(uploadResult.shareCode)
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload & Share File</h1>
        <p className="text-lg text-gray-600">
          Upload your file securely with encryption and get a share code for others to download
        </p>
      </div>

      {!uploadResult ? (
        <FileUpload onUploadSuccess={handleUploadSuccess} />
      ) : (
        <div className="space-y-6">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-900">
                  File Uploaded Successfully!
                </h3>
                <p className="text-green-800 mt-1">
                  Your file has been encrypted and uploaded securely.
                </p>
              </div>
            </div>
          </div>

          {/* Share Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Share Information</h3>
            
            <div className="space-y-4">
              {/* Share Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={uploadResult.shareCode}
                    readOnly
                    onClick={async () => {
                      // When share code is clicked, copy both share code and password if available
                      const textToCopy = uploadResult.password 
                        ? `${uploadResult.shareCode}\n${uploadResult.password}`
                        : uploadResult.shareCode
                      await copyToClipboard(textToCopy)
                    }}
                    className="input flex-1 font-mono text-lg cursor-pointer"
                    title={uploadResult.password ? "Click to copy share code and password" : "Click to copy share code"}
                  />
                  <button
                    onClick={async () => {
                      // Copy both share code and password if available
                      const textToCopy = uploadResult.password 
                        ? `${uploadResult.shareCode}\n${uploadResult.password}`
                        : uploadResult.shareCode
                      await copyToClipboard(textToCopy)
                    }}
                    className="btn-secondary"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {uploadResult.password 
                    ? 'Click the share code or button to copy both share code and password'
                    : 'Share this code with others to allow them to download the file'}
                </p>
              </div>

              {/* File Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Expires</p>
                    <p className="text-sm text-gray-500">{formatDate(uploadResult.expiryTime)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Max Downloads</p>
                    <p className="text-sm text-gray-500">
                      {uploadResult.maxDownloads || 'Unlimited'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Lock className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Password Protected</p>
                    <p className="text-sm text-gray-500">
                      {uploadResult.passwordRequired ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="h-5 w-5 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                    <div className="h-2 w-2 bg-primary-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <p className="text-sm text-gray-500">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Share Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Share Options</h3>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={shareViaWebAPI}
                className="btn-primary flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share via Web
              </button>
              
              <button
                onClick={() => copyToClipboard(`Download my file using this code: ${uploadResult.shareCode}\n\nVisit: ${window.location.origin}/download`)}
                className="btn-secondary flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Share Message
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-medium text-blue-900 mb-3">Instructions for Recipients:</h4>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Go to the download page</li>
              <li>Enter the share code: <code className="bg-blue-100 px-1 rounded">{uploadResult.shareCode}</code></li>
              <li>Enter the password if the file is password protected</li>
              <li>Click "Download File" to save to their device</li>
            </ol>
          </div>

          {/* Upload Another File */}
          <div className="text-center">
            <button
              onClick={() => setUploadResult(null)}
              className="btn-secondary"
            >
              Upload Another File
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Upload
