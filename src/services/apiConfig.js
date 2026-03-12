// API Configuration - Centralized endpoint management
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  ENDPOINTS: {
    // Authentication endpoints
    AUTH: {
      SEND_OTP: '/auth/send-otp',
      VERIFY_OTP: '/auth/verify-otp',
      LOGOUT: '/auth/logout',
    },
    // Conversations endpoints
    CONVERSATIONS: {
      LIST: '/conversations',
      CREATE: '/conversations',
      GET_BY_ID: (id) => `/conversations/${id}`,
      DELETE: (id) => `/conversations/${id}`,
      DELETE_MULTIPLE: '/conversations/delete-multiple',
      SEND_MESSAGE: (id) => `/conversations/${id}/message`,
    },
  },
}

/**
 * Build complete URL for an endpoint
 * @param {string} endpoint - The endpoint path
 * @returns {string} Complete API URL
 */
export const getApiUrl = (endpoint) => {
  // If endpoint is already a function (like GET_BY_ID), it won't have a leading slash issue
  if (typeof endpoint === 'function') {
    throw new Error('Use endpoint(id) to get the URL, not the function itself')
  }
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

export default API_CONFIG
