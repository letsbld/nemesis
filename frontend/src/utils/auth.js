// Helper function to decode JWT token
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}

// Check if user is admin from token (client-side check only)
// For server-side verification, use checkAdmin API call
export const isAdminFromToken = () => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    return false
  }
  
  const decoded = decodeToken(token)
  return decoded && decoded.isAdmin === true
}


