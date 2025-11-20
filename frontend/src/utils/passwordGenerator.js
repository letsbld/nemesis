/**
 * Browser-Compatible Password Generator
 * 
 * Pure JavaScript password generator that works in the browser.
 * This is a client-side version of the password manager functions.
 */

const characterSets = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
}

const memorableWords = [
  'aurora', 'cascade', 'breeze', 'comet', 'drift', 'echo', 'ember', 'fjord',
  'galaxy', 'haven', 'azure', 'ivory', 'jade', 'lagoon', 'lunar', 'mist',
  'nebula', 'oasis', 'orbit', 'purity', 'quartz', 'raven', 'ripple', 'serene',
  'shadow', 'summit', 'terra', 'unity', 'valor', 'vortex', 'willow', 'zenith'
]

/**
 * Generate a smart password
 * @param {Object} options - Password options
 * @param {number} options.length - Password length (default: 16)
 * @param {boolean} options.uppercase - Include uppercase letters (default: true)
 * @param {boolean} options.lowercase - Include lowercase letters (default: true)
 * @param {boolean} options.numbers - Include numbers (default: true)
 * @param {boolean} options.symbols - Include symbols (default: true)
 * @returns {string} Generated password
 */
export function generateSmartPassword(options = {}) {
  const {
    length = 16,
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true
  } = options

  let charset = ''
  if (uppercase) charset += characterSets.uppercase
  if (lowercase) charset += characterSets.lowercase
  if (numbers) charset += characterSets.numbers
  if (symbols) charset += characterSets.symbols

  if (!charset) {
    throw new Error('At least one character set must be enabled')
  }

  let password = ''
  const randomValues = new Uint32Array(length)
  crypto.getRandomValues(randomValues)
  
  for (let i = 0; i < length; i++) {
    const randomIndex = randomValues[i] % charset.length
    password += charset[randomIndex]
  }

  return password
}

/**
 * Generate a memorable password
 * @param {Object} options - Password options
 * @param {number} options.words - Number of words (default: 4)
 * @param {string} options.separator - Word separator (default: '-')
 * @param {boolean} options.capitalize - Capitalize words (default: true)
 * @returns {string} Generated password
 */
export function generateMemorablePassword(options = {}) {
  const {
    words = 4,
    separator = '-',
    capitalize = true
  } = options

  const selectedWords = []
  const randomValues = new Uint32Array(words)
  crypto.getRandomValues(randomValues)

  for (let i = 0; i < words; i++) {
    const randomIndex = randomValues[i] % memorableWords.length
    let word = memorableWords[randomIndex]
    
    if (capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1)
    }
    
    selectedWords.push(word)
  }

  return selectedWords.join(separator)
}

/**
 * Generate a PIN
 * @param {Object} options - PIN options
 * @param {number} options.length - PIN length (default: 6)
 * @returns {string} Generated PIN
 */
export function generatePin(options = {}) {
  const { length = 6 } = options

  let pin = ''
  const randomValues = new Uint32Array(length)
  crypto.getRandomValues(randomValues)

  for (let i = 0; i < length; i++) {
    pin += (randomValues[i] % 10).toString()
  }

  return pin
}

/**
 * Calculate password strength
 * @param {string} password - Password to analyze
 * @returns {string} Strength level: 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'
 */
export function calculateStrength(password) {
  if (!password) return 'Very Weak'

  let score = 0
  const length = password.length

  // Length scoring
  if (length >= 12) score += 2
  else if (length >= 8) score += 1
  else if (length < 6) score -= 1

  // Character variety
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSymbol = /[^a-zA-Z0-9]/.test(password)

  const varietyCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length
  score += varietyCount - 1

  // Common patterns (penalties)
  if (/(.)\1{2,}/.test(password)) score -= 1 // Repeated characters
  if (/123|abc|qwe/i.test(password)) score -= 1 // Sequential patterns
  if (/password|admin|123456/i.test(password)) score -= 2 // Common passwords

  // Determine strength
  if (score >= 4) return 'Strong'
  if (score >= 2) return 'Good'
  if (score >= 0) return 'Fair'
  if (score >= -1) return 'Weak'
  return 'Very Weak'
}

/**
 * Generate password by type
 * @param {string} type - 'smart', 'memorable', or 'pin'
 * @param {Object} options - Type-specific options
 * @returns {Object} Generated password with metadata
 */
export function generatePassword(type = 'smart', options = {}) {
  let password
  let strength

  switch (type.toLowerCase()) {
    case 'smart':
      password = generateSmartPassword(options)
      break
    case 'memorable':
      password = generateMemorablePassword(options)
      break
    case 'pin':
      password = generatePin(options)
      break
    default:
      throw new Error(`Unknown password type: ${type}`)
  }

  strength = calculateStrength(password)

  return {
    password,
    type,
    strength,
    length: password.length
  }
}

/**
 * Generate password optimized for file protection
 * @param {string} strength - 'strong', 'good', or 'fair'
 * @returns {Object} Generated password with metadata
 */
export function generatePasswordForFile(strength = 'strong') {
  let options

  switch (strength) {
    case 'strong':
      options = {
        type: 'smart',
        length: 20,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true
      }
      break
    case 'good':
      options = {
        type: 'smart',
        length: 16,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: false
      }
      break
    case 'fair':
      options = {
        type: 'memorable',
        words: 4,
        separator: '-',
        capitalize: true
      }
      break
    default:
      options = {
        type: 'smart',
        length: 16,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true
      }
  }

  return generatePassword(options.type, options)
}

export default {
  generateSmartPassword,
  generateMemorablePassword,
  generatePin,
  generatePassword,
  generatePasswordForFile,
  calculateStrength
}







