/**
 * API Configuration and Helper Functions
 * Handles all communication with the Laravel backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Generic API request function
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} data - Request body data
 * @param {string} token - Authentication token
 * @returns {Promise} API response
 */
export const apiRequest = async (endpoint, method = 'GET', data = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Get token from localStorage if not provided
  const authToken = token || localStorage.getItem('token');
  
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const config = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || `API Error: ${response.status}`);
    }

    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Login API call
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Login response with token
 */
export const loginAPI = async (email, password) => {
  return apiRequest('/login', 'POST', {
    email,
    password,
  });
};

/**
 * Register API call
 * @param {object} userData - User data (name, email, password, password_confirmation)
 * @returns {Promise} Registration response with token
 */
export const registerAPI = async (userData) => {
  return apiRequest('/register', 'POST', userData);
};

/**
 * Get current user profile
 * @param {string} token - Authentication token
 * @returns {Promise} User profile data
 */
export const getUserProfile = async (token) => {
  return apiRequest('/user', 'GET', null, token);
};

/**
 * Logout API call
 * @param {string} token - Authentication token
 * @returns {Promise} Logout response
 */
export const logoutAPI = async (token) => {
  return apiRequest('/logout', 'POST', null, token);
};

/**
 * Get stored token from localStorage
 * @returns {string|null} Token or null
 */
export const getStoredToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get stored user from localStorage
 * @returns {object|null} User object or null
 */
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Store authentication data
 * @param {string} token - Authentication token
 * @param {object} user - User data
 */
export const storeAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Clear authentication data
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists
 */
export const isAuthenticated = () => {
  return !!getStoredToken();
};

const apiService = {
  apiRequest,
  loginAPI,
  registerAPI,
  getUserProfile,
  logoutAPI,
  getStoredToken,
  getStoredUser,
  storeAuthData,
  clearAuthData,
  isAuthenticated,
};

export default apiService;
