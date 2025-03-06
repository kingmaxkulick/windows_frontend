// API configuration for both development and production environments
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://localhost:8000' // Production backend URL
  : 'http://localhost:8000'; // Development backend URL

export const API_ENDPOINTS = {
  VEHICLE_DATA: `${API_BASE_URL}/vehicle_data`,
  CAN_STATISTICS: `${API_BASE_URL}/can_statistics`,
  CAN_ERRORS: `${API_BASE_URL}/can_errors`,
  AVAILABLE_MESSAGES: `${API_BASE_URL}/available_messages`,
  LOGGING: {
    START: `${API_BASE_URL}/logging/start`,
    STOP: `${API_BASE_URL}/logging/stop`,
    STATUS: `${API_BASE_URL}/logging/status`,
    LIST: `${API_BASE_URL}/logging/list`,
    DOWNLOAD: (id: number) => `${API_BASE_URL}/logging/download/${id}`
  }
};

export default API_BASE_URL;