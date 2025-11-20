import { Shield, Lock, Clock, Users, Upload, Download, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: 'End-to-End Encryption',
      description: 'All files are encrypted before upload using AES-256 encryption for maximum security.'
    },
    {
      icon: Lock,
      title: 'Password Protection',
      description: 'Add an extra layer of security with optional password protection for your shared files.'
    },
    {
      icon: Clock,
      title: 'Auto-Expiration',
      description: 'Files automatically expire after a set time period, ensuring your data doesn\'t stay online forever.'
    },
    {
      icon: Users,
      title: 'Download Limits',
      description: 'Control access by setting maximum download limits for your shared files.'
    }
  ]

  const quickActions = [
    {
      title: 'Upload & Share',
      description: 'Upload a file and get a secure share code',
      icon: Upload,
      link: '/upload',
      color: 'bg-primary-600 hover:bg-primary-700'
    },
    {
      title: 'Download File',
      description: 'Download a file using a share code',
      icon: Download,
      link: '/download',
      color: 'bg-success-600 hover:bg-success-700'
    },
    {
      title: 'Manage Files',
      description: 'View and manage your shared files',
      icon: Settings,
      link: '/manage',
      color: 'bg-warning-600 hover:bg-warning-700'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary-100 rounded-full">
            <Shield className="h-16 w-16 text-primary-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Secure File Sharing
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Share files securely with end-to-end encryption, password protection, 
          and automatic expiration. Your files are protected and automatically cleaned up.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.title}
              to={action.link}
              className="group block"
            >
              <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className={`inline-flex p-3 rounded-lg ${action.color} mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600">
                  {action.description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Features */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Security Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full text-lg font-bold mb-4">
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload File
            </h3>
            <p className="text-gray-600">
              Select your file and set security options like expiry time and password protection.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full text-lg font-bold mb-4">
              2
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Get Share Code
            </h3>
            <p className="text-gray-600">
              Receive a unique share code that you can send to others for secure access.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full text-lg font-bold mb-4">
              3
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Auto-Cleanup
            </h3>
            <p className="text-gray-600">
              Files automatically expire and are deleted after the specified time period.
            </p>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start">
          <Shield className="h-6 w-6 text-green-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Your Security is Our Priority
            </h3>
            <p className="text-green-800">
              All files are encrypted using industry-standard AES-256 encryption before being uploaded to Dropbox. 
              Your files are automatically deleted after expiration, and we never store your encryption keys or passwords.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
