import API_CONFIG, { getApiUrl } from './apiConfig'

/**
 * Generic fetch wrapper with common error handling
 */
const apiFetch = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint)
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, { ...defaultOptions, ...options })
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error)
    throw error
  }
}

/**
 * Authentication API calls
 */
export const authApi = {
  sendOtp: (phoneNumber) =>
    apiFetch(API_CONFIG.ENDPOINTS.AUTH.SEND_OTP, {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    }),

  verifyOtp: (phoneNumber, otp) =>
    apiFetch(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP, {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp }),
    }),

  logout: (phoneNumber) =>
    apiFetch(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    }),
}

/**
 * Conversations API calls
 */
export const conversationsApi = {
  list: (userId, page = 1, limit = 20) =>
    apiFetch(`${API_CONFIG.ENDPOINTS.CONVERSATIONS.LIST}?userId=${userId}&page=${page}&limit=${limit}`),

  create: (userId, title = 'New chat') =>
    apiFetch(API_CONFIG.ENDPOINTS.CONVERSATIONS.CREATE, {
      method: 'POST',
      body: JSON.stringify({ userId, title }),
    }),

  sendMessage: (conversationId, content, userId) =>
    apiFetch(API_CONFIG.ENDPOINTS.CONVERSATIONS.SEND_MESSAGE(conversationId), {
      method: 'POST',
      body: JSON.stringify({ content, userId }),
    }),

  delete: (conversationId, userId) =>
    apiFetch(API_CONFIG.ENDPOINTS.CONVERSATIONS.DELETE(conversationId), {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    }),

  deleteMultiple: (ids, userId) =>
    apiFetch(API_CONFIG.ENDPOINTS.CONVERSATIONS.DELETE_MULTIPLE, {
      method: 'POST',
      body: JSON.stringify({ ids, userId }),
    }),
}

export default {
  authApi,
  conversationsApi,
}
