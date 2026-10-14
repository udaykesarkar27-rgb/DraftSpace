import axios from 'axios';

// Use hardcoded local port 8081 or Vite environment variable fallback
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export const TOKEN_KEY = 'token';
export const USER_KEY = 'username';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach the JWT token with debug logs
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('fieldnotes_token');

    if (token && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token.trim()}`;
      console.log('Interceptor: Token attached successfully.');
    } else {
      console.warn('Interceptor Warning: No valid JWT token found in localStorage!');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

// Helper functions for error handling
export const getErrorMessage = (err) => {
  if (err.response?.data?.message) return err.response.data.message;
  if (typeof err.response?.data === 'string') return err.response.data;
  return err.message || 'An unexpected error occurred';
};

export const getFieldErrors = (err) => {
  return err.response?.data?.errors || {};
};