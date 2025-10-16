import { auth } from '../store/useStore';

// API Configuration
const API_BASE_URL = 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  
  // Agent endpoints
  CREATE_AGENT: `${API_BASE_URL}/api/agent/create`,
  GET_AGENTS: `${API_BASE_URL}/api/agent`,
  
  // Call endpoints
  UPLOAD_CSV: `${API_BASE_URL}/api/call/upload-csv`,
  START_CALLS: `${API_BASE_URL}/api/call/start-calls`,
  GET_CALLS: `${API_BASE_URL}/api/call`,
  GET_DASHBOARD_STATS: `${API_BASE_URL}/api/call/dashboard`,
  
  // Transcript endpoints
  GET_TRANSCRIPT: `${API_BASE_URL}/api/transcript`,
  
  // Settings endpoints
  UPDATE_SETTINGS: `${API_BASE_URL}/api/settings/update`,
  GET_SETTINGS: `${API_BASE_URL}/api/settings`,
};

export const getAuthHeaders = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }
  } catch (error) {
    console.warn('Failed to get auth token:', error);
  }
  return {
    'Content-Type': 'application/json'
  };
};

export const apiRequest = async (url, options = {}) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export default API_BASE_URL;
