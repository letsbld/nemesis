import { useState } from 'react'
import { Key, RefreshCw, Copy, Check, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { generatePassword, generatePasswordForFile, calculateStrength } from '../utils/passwordGenerator'
import { generatePassword as generatePasswordApi } from '../services/api'

const PasswordGenerator = ({ onPasswordGenerated, useApi = false }) => {
  const [password, setPassword] = useState('')
  const [strength, setStrength] = useState('')
  const [type, setType] = useState('smart')
  const [options, setOptions] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    words: 4,
    separator: '-',
    capitalize: true
  })
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      let result

      if (useApi) {
        // Use API (calls backend)
        const response = await generatePasswordApi(type, options)
        result = {
          password: response.password,
          strength: response.strength,
          type: response.type
        }
      } else {
        // Use local generator (browser)
        result = generatePassword(type, options)
      }

      setPassword(result.password)
      setStrength(result.strength)
      
      // Callback to parent component
      if (onPasswordGenerated) {
        onPasswordGenerated(result.password)
      }

      toast.success('Password generated!')
    } catch (error) {
      console.error('Password generation error:', error)
      toast.error('Failed to generate password')
    } finally {
      setGenerating(false)
    }
  }

  const handleGenerateForFile = async () => {
    setGenerating(true)
    try {
      let result

      if (useApi) {
        const response = await generatePasswordApi('smart', {
          length: 16,
          uppercase: true,
          lowercase: true,
          numbers: true,
          symbols: true
        })
        result = {
          password: response.password,
          strength: response.strength
        }
      } else {
        result = generatePasswordForFile('strong')
      }

      setPassword(result.password)
      setStrength(result.strength)
      setType('smart')
      
      if (onPasswordGenerated) {
        onPasswordGenerated(result.password)
      }

      toast.success('Strong password generated for file protection!')
    } catch (error) {
      console.error('Password generation error:', error)
      toast.error('Failed to generate password')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = () => {
    if (password) {
      navigator.clipboard.writeText(password)
      setCopied(true)
      toast.success('Password copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOptionChange = (key, value) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const getStrengthColor = () => {
    switch (strength) {
      case 'Strong':
        return 'text-green-600 bg-green-50'
      case 'Good':
        return 'text-blue-600 bg-blue-50'
      case 'Fair':
        return 'text-yellow-600 bg-yellow-50'
      case 'Weak':
        return 'text-orange-600 bg-orange-50'
      case 'Very Weak':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Key className="h-5 w-5 mr-2" />
          Password Generator
        </h3>
        <button
          onClick={handleGenerateForFile}
          disabled={generating}
          className="text-sm px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
        >
          <Sparkles className="h-4 w-4 mr-1" />
          Strong Password
        </button>
      </div>

      {/* Password Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password Type
        </label>
        <div className="flex gap-2">
          {['smart', 'memorable', 'pin'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                type === t
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Type-specific Options */}
      {type === 'smart' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Length: {options.length}
            </label>
            <input
              type="range"
              min="8"
              max="32"
              value={options.length}
              onChange={(e) => handleOptionChange('length', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['uppercase', 'lowercase', 'numbers', 'symbols'].map((opt) => (
              <label key={opt} className="flex items-center">
                <input
                  type="checkbox"
                  checked={options[opt]}
                  onChange={(e) => handleOptionChange(opt, e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 capitalize">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {type === 'memorable' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Words: {options.words}
            </label>
            <input
              type="range"
              min="3"
              max="6"
              value={options.words}
              onChange={(e) => handleOptionChange('words', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Separator
            </label>
            <input
              type="text"
              value={options.separator}
              onChange={(e) => handleOptionChange('separator', e.target.value)}
              maxLength={1}
              className="input w-20"
            />
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.capitalize}
              onChange={(e) => handleOptionChange('capitalize', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Capitalize words</span>
          </label>
        </div>
      )}

      {type === 'pin' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PIN Length: {options.length || 6}
          </label>
          <input
            type="range"
            min="4"
            max="12"
            value={options.length || 6}
            onChange={(e) => handleOptionChange('length', parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {/* Generated Password Display */}
      {password && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={password}
              readOnly
              className="input flex-1 font-mono text-sm"
            />
            <button
              onClick={handleCopy}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Copy password"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>
          {strength && (
            <div className={`px-3 py-1 rounded-md text-sm font-medium text-center ${getStrengthColor()}`}>
              Strength: {strength}
            </div>
          )}
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {generating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Generating...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate Password
          </>
        )}
      </button>

      {useApi && (
        <p className="text-xs text-gray-500 text-center">
          Using backend API for password generation
        </p>
      )}
    </div>
  )
}

export default PasswordGenerator







