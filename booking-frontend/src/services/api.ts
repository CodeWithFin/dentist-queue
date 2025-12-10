import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

console.log('🔧 API Service initialized with URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message,
      error
    });
    return Promise.reject(error);
  }
);

export default api;


