import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send the httpOnly auth cookie
  timeout: 15000,
});

// Attach the bearer token as a fallback auth path (in case cookies are
// blocked, e.g. some in-app browsers) — cookie auth is primary.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('connecthub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize error messages so calling code can just read err.message
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong. Please try again.';

    if (error.response?.status === 401) {
      localStorage.removeItem('connecthub_token');
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
