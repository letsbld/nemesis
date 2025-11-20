import axios from 'axios'

// Note: axios is imported at the top, but we need to use it in the interceptor
// This is a circular dependency workaround

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Token refresh helper
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const refreshToken = async () => {
  const refreshTokenValue = localStorage.getItem('refreshToken')
  if (!refreshTokenValue) {
    throw new Error('No refresh token available')
  }

  try {
    const response = await axios.post('/api/auth/refresh', {}, {
      headers: {
        Authorization: `Bearer ${refreshTokenValue}`
      }
    })

    if (response.data.success) {
      localStorage.setItem('authToken', response.data.token)
      return response.data.token
    }
    throw new Error('Token refresh failed')
  } catch (error) {
    // Clear tokens and redirect to login
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    window.location.href = '/'
    throw error
  }
}

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(err => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await refreshToken()
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        isRefreshing = false
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        isRefreshing = false
        // Clear tokens and redirect to login
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// File upload
export const uploadFile = async (file, options = {}) => {
  const formData = new FormData()
  formData.append('file', file)
  
  if (options.expiryHours) {
    formData.append('expiryHours', options.expiryHours)
  }
  if (options.maxDownloads) {
    formData.append('maxDownloads', options.maxDownloads)
  }
  if (options.password) {
    formData.append('password', options.password)
  }

  const response = await api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (options.onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        options.onProgress(percentCompleted)
      }
    },
  })

  return response.data
}

// File download
export const downloadFile = async (shareCode, password = null) => {
  const response = await api.post('/files/download', {
    shareCode,
    password,
  }, {
    responseType: 'blob',
  })

  return response
}

// Get file info
export const getFileInfo = async (shareCode) => {
  const response = await api.get(`/files/info/${shareCode}`)
  return response.data
}

// List files (admin)
export const listFiles = async () => {
  const response = await api.get('/files/list')
  return response.data
}

// List share codes (admin)
export const listShares = async () => {
  const response = await api.get('/files/shares')
  return response.data
}

// Delete file (admin)
export const deleteFile = async (fileId) => {
  const response = await api.delete(`/files/${fileId}`)
  return response.data
}

// Revoke share code (admin)
export const revokeShare = async (shareCode) => {
  const response = await api.delete(`/files/share/${shareCode}`)
  return response.data
}

// Run cleanup (admin)
export const runCleanup = async () => {
  const response = await api.post('/files/cleanup')
  return response.data
}

// Get file sharing activity logs
export const getFileActivityLogs = async (type = 'all') => {
  const response = await api.get(`/files/activity?type=${type}`)
  return response.data
}

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health')
  console.log('Health check response:', response.data)
  return response.data
}

// Login function - stores both access and refresh tokens
export const login = async (firstName, companyEmail) => {
  const response = await api.post('/auth/login', {
    firstName,
    companyEmail
  })
  
  if (response.data.success) {
    // Store both tokens
    localStorage.setItem('authToken', response.data.token)
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken)
    }
  }
  
  return response.data
}

// Admin login function
export const adminLogin = async (firstName) => {
  const response = await api.post('/auth/admin-login', {
    firstName
  })
  
  if (response.data.success) {
    // Store both tokens
    localStorage.setItem('authToken', response.data.token)
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken)
    }
  }
  
  return response.data
}

// Check if current user is admin
// Works with both JWT tokens and proxy headers (X-User-*)
export const checkAdmin = async () => {
  try {
    const response = await api.get('/auth/check-admin')
    return response.data
  } catch (error) {
    console.error('Error checking admin status:', error)
    return { 
      success: false, 
      isAdmin: false, 
      authenticated: false,
      error: error.response?.data?.error || 'Failed to check admin status'
    }
  }
}

// Logout function - clears all tokens
export const logout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
  window.location.href = '/'
}

export default api
