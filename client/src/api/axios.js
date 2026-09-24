import axios from 'axios';

const PRODUCTION_API_URL = 'https://skill-swap-server-yqck.onrender.com';

const rawBaseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : PRODUCTION_API_URL);

// Normalize API base URL cleanly
const cleanBaseUrl = rawBaseUrl ? rawBaseUrl.replace(/\/+$/, '') : '';
const apiBaseUrl = cleanBaseUrl 
  ? (cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`)
  : '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && token !== 'null' && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle automatic redirect on protected routes, not on auth routes
    const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
    if (error.response && error.response.status === 401 && !isAuthRoute) {
      localStorage.removeItem('token');
      const publicPaths = ['/login', '/register', '/'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
