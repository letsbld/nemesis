import axios from 'axios';

// Use relative URLs in production (nginx will proxy), or use env var if set
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5001');

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and DLP headers
api.interceptors.request.use(
  (config) => {
    // Add admin token if available
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    
    // Add DLP backend headers (user ID, username, and role)
    // These should be passed from the parent DLP backend
    const userId = 
      localStorage.getItem('dlp_user_id') || 
      localStorage.getItem('x-user-id') ||
      new URLSearchParams(window.location.search).get('userId') ||
      new URLSearchParams(window.location.search).get('user-id') ||
      new URLSearchParams(window.location.search).get('x-user-id');
    
    const username = 
      localStorage.getItem('dlp_username') || 
      localStorage.getItem('x-username') ||
      new URLSearchParams(window.location.search).get('username') ||
      new URLSearchParams(window.location.search).get('x-username');
    
    const role = 
      localStorage.getItem('dlp_role') || 
      localStorage.getItem('x-role') ||
      new URLSearchParams(window.location.search).get('role') ||
      new URLSearchParams(window.location.search).get('x-role');
    
    if (userId) {
      config.headers['x-user-id'] = userId;
      config.headers['user-id'] = userId;
    }
    
    if (username) {
      config.headers['x-username'] = username;
      config.headers['username'] = username;
    }
    
    if (role) {
      config.headers['x-role'] = role;
      config.headers['role'] = role;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log network errors for debugging
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.error('Network Error - Backend may not be running or CORS issue:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        message: error.message
      });
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
      // Don't redirect for header-based auth
      if (!localStorage.getItem('dlp_user_id')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (employeeId) => {
    const response = await api.post('/auth/login', { employee_id: employeeId });
    return response.data;
  },
  
  adminLogin: async (username, password) => {
    const response = await api.post('/admin/auth/login', { username, password });
    return response.data;
  },
  
  verify: async () => {
    const response = await api.get('/auth/verify');
    // Backend returns { message, userid, employee: { id, first_name } }
    // Transform to match expected format
    if (response.data && response.data.employee) {
      return {
        success: true,
        employee: {
          id: response.data.employee.id,
          employee_id: response.data.userid || response.data.employee.id,
          first_name: response.data.employee.first_name,
          name: response.data.employee.first_name,
        },
      };
    }
    // If error response
    if (response.data && response.data.error) {
      return { success: false, error: response.data.error || response.data.message || 'Authentication failed' };
    }
    return { success: false, error: 'Employee data not found' };
  },
  
  verifyAdmin: async () => {
    const response = await api.get('/admin/auth/verify');
    return response.data;
  },
};

// Employee API
export const employeeAPI = {
  getProfile: async (employeeId) => {
    const response = await api.get(`/employee/${employeeId}`);
    return response.data;
  },
  
  getProgress: async (employeeId) => {
    const response = await api.get(`/employee/${employeeId}/progress`);
    return response.data;
  },
};

// Quiz API
export const quizAPI = {
  generate: async (moduleId, topic) => {
    const response = await api.post('/quiz/generate', {
      module_id: moduleId,
      topic: topic,
    });
    return response.data;
  },
  
  getSession: async (sessionId) => {
    const response = await api.get(`/quiz/${sessionId}`);
    return response.data;
  },
  
  getReview: async (sessionId) => {
    const response = await api.get(`/quiz/${sessionId}/review`);
    // Backend returns the data directly, not wrapped in data property
    return response.data;
  },
  
  submitAnswer: async (sessionId, answers) => {
    // Backend expects: { quiz_session_id, answers: [{ question_id, selected_answer }] }
    const response = await api.post('/answer/submit', {
      quiz_session_id: parseInt(sessionId, 10),
      answers: answers,
    });
    return response;
  },
};

// Training Modules API
export const trainingAPI = {
  getModules: async () => {
    const response = await api.get('/training-modules');
    return response.data;
  },
  
  getLessons: async () => {
    const response = await api.get('/lessons');
    return response.data;
  },
};

// Certificate API
export const certificateAPI = {
  getCertificate: async (resultId) => {
    const response = await api.get(`/certificate/${resultId}`);
    return response.data;
  },
  
  generatePDF: async (resultId) => {
    const response = await api.post(`/certificate/${resultId}/generate-pdf`);
    return response.data;
  },
  
  downloadPDF: async (resultId) => {
    const response = await api.get(`/certificate/${resultId}/download-pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getOverview: async () => {
    const response = await api.get('/dashboard/overview');
    return response.data;
  },
  
  getEmployees: async () => {
    const response = await api.get('/dashboard/employees');
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getEmployees: async (filters = {}) => {
    const response = await api.get('/admin/employees', { params: filters });
    return response.data;
  },
  
  getDashboardOverview: async () => {
    const response = await api.get('/admin/dashboard/overview');
    return response.data;
  },
  
  resetEmployeeQuiz: async (employeeId, moduleId) => {
    const response = await api.post(`/admin/employees/${employeeId}/reset-quiz`, {
      moduleId: moduleId,
    });
    return response.data;
  },
  
  getActionHistory: async (filters = {}) => {
    const response = await api.get('/admin/actions/history', { params: filters });
    return response.data;
  },
  
  getFailureTracking: async () => {
    const response = await api.get('/admin/failure-tracking/active');
    return response.data;
  },
  
  getBlockedEmployees: async () => {
    const response = await api.get('/admin/blocked-employees');
    return response.data;
  },
  
  unblockEmployee: async (employeeId) => {
    const response = await api.post(`/admin/employees/${employeeId}/unblock`);
    return response.data;
  },
  
  getFailureStats: async () => {
    const response = await api.get('/admin/failure-tracking/stats');
    return response.data;
  },
  
  getEmployeeTrainingStatus: async (employeeId = null) => {
    const url = employeeId 
      ? `/admin/employee-training-status/${employeeId}`
      : '/admin/employee-training-status';
    const response = await api.get(url);
    return response.data;
  },
  
  getModuleStatusSummary: async () => {
    const response = await api.get('/admin/module-status-summary');
    return response.data;
  },
  
  getEmployeeStatusSummary: async () => {
    const response = await api.get('/admin/employee-status-summary');
    return response.data;
  },
  
  getActiveSessions: async () => {
    const response = await api.get('/admin/active-sessions');
    return response.data;
  },
  
  getCertificates: async () => {
    const response = await api.get('/admin/certificates');
    return response.data;
  },
};

export default api;

