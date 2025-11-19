import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

// Helper to get user ID from headers (when embedded in DLP backend)
const getUserIdFromHeaders = () => {
  // Try to get from URL params first (if passed from parent)
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId') || urlParams.get('user-id') || urlParams.get('x-user-id');
  
  if (userId) return userId;
  
  // Try to get from localStorage (if set by parent window)
  const storedUserId = localStorage.getItem('dlp_user_id') || localStorage.getItem('x-user-id');
  
  return storedUserId;
};

// Helper to get username from headers
const getUsernameFromHeaders = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('username') || urlParams.get('x-username');
  
  if (username) return username;
  
  const storedUsername = localStorage.getItem('dlp_username') || localStorage.getItem('x-username');
  
  return storedUsername;
};

// Helper to get role from headers
const getRoleFromHeaders = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const role = urlParams.get('role') || urlParams.get('x-role');
  
  if (role) return role;
  
  const storedRole = localStorage.getItem('dlp_role') || localStorage.getItem('x-role');
  
  return storedRole;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Listen for messages from parent window (if embedded in iframe)
    const handleMessage = (event) => {
      // In production, verify event.origin for security
      if (event.data && event.data.type === 'DLP_AUTH') {
        const { userId, username, role } = event.data;
        if (userId) {
          localStorage.setItem('dlp_user_id', userId);
          if (username) {
            localStorage.setItem('dlp_username', username);
          }
          if (role) {
            localStorage.setItem('dlp_role', role);
          }
          // Re-initialize auth with new data
          initializeAuth();
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Initialize authentication from headers
    initializeAuth();

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      setAuthError(null);

      // Check for admin token first (admin uses login page)
      const adminToken = localStorage.getItem('adminToken');
      const savedAdmin = localStorage.getItem('admin');
      
      if (adminToken && savedAdmin) {
        try {
          setAdmin(JSON.parse(savedAdmin));
          setLoading(false);
          return;
        } catch (e) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('admin');
        }
      }

      // Get role from headers
      const role = getRoleFromHeaders();
      setUserRole(role);
      
      // If role is admin, check for admin token or allow admin access
      if (role === 'admin') {
        // Admin can access both quiz and admin dashboard
        // Don't require userId for admin role
        setLoading(false);
        return;
      }

      // For regular users, verify using headers
      const userId = getUserIdFromHeaders();
      
      if (!userId) {
        setAuthError('No user ID found. Please access this portal through the DLP backend.');
        setLoading(false);
        return;
      }

      // Verify user with backend (backend will use headers)
      try {
        const response = await authAPI.verify();
        
        if (response.success && response.employee) {
          setUser(response.employee);
          // Store user ID for API calls
          localStorage.setItem('dlp_user_id', userId);
          if (response.employee.first_name) {
            localStorage.setItem('dlp_username', response.employee.first_name);
          }
        } else {
          // If verify fails (e.g., user not in employees table), still allow access
          // The backend will handle authentication on each request
          console.warn('Verify endpoint returned error, but allowing access with user ID:', response.error);
          localStorage.setItem('dlp_user_id', userId);
          const username = getUsernameFromHeaders();
          if (username) {
            localStorage.setItem('dlp_username', username);
            setUser({
              id: userId,
              employee_id: userId,
              first_name: username,
              name: username,
            });
          } else {
            // Try to get username from response if available
            setUser({
              id: userId,
              employee_id: userId,
              first_name: userId,
              name: userId,
            });
          }
        }
      } catch (verifyError) {
        // If verify fails, still allow access - backend will authenticate on each request
        console.warn('Verify endpoint failed, but allowing access with user ID:', verifyError);
        localStorage.setItem('dlp_user_id', userId);
        const username = getUsernameFromHeaders();
        if (username) {
          localStorage.setItem('dlp_username', username);
          setUser({
            id: userId,
            employee_id: userId,
            first_name: username,
            name: username,
          });
        } else {
          // Create minimal user object with user ID as name
          setUser({
            id: userId,
            employee_id: userId,
            first_name: userId,
            name: userId,
          });
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthError('Failed to authenticate. Please ensure you are accessing through the DLP backend.');
    } finally {
      setLoading(false);
    }
  };

  const login = async (employeeId) => {
    // This should not be used for regular users, but kept for compatibility
    try {
      const response = await authAPI.login(employeeId);
      if (response.success && response.authenticated) {
        const userData = response.employee;
        setUser(userData);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: response.error || 'Login failed' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed. Please try again.',
      };
    }
  };

  const adminLogin = async (username, password) => {
    try {
      const response = await authAPI.adminLogin(username, password);
      if (response.success && response.authenticated) {
        const adminData = response.admin;
        setAdmin(adminData);
        localStorage.setItem('adminToken', response.token);
        localStorage.setItem('admin', JSON.stringify(adminData));
        return { success: true };
      }
      return { success: false, error: response.error || 'Login failed' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed. Please try again.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    setAdmin(null);
    setUserRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    localStorage.removeItem('dlp_user_id');
    localStorage.removeItem('dlp_username');
    localStorage.removeItem('dlp_role');
    localStorage.removeItem('x-user-id');
    localStorage.removeItem('x-username');
    localStorage.removeItem('x-role');
  };

  const value = {
    user,
    admin,
    loading,
    authError,
    login,
    adminLogin,
    logout,
    initializeAuth,
    isAuthenticated: !!user,
    isAdmin: !!admin || userRole === 'admin',
    userRole: userRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

