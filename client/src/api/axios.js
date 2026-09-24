import axios from 'axios';

// In development, Vite dev server proxies '/api' to 'http://localhost:5000/api'.
// In production on Vercel, vercel.json rewrites '/api' to Render backend directly, eliminating all browser CORS issues.
// If VITE_API_URL is explicitly configured, it will be used instead.
const rawBaseUrl = import.meta.env.VITE_API_URL;

let apiBaseUrl = '/api';
if (rawBaseUrl && rawBaseUrl.trim() !== '') {
  const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');
  apiBaseUrl = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;
}

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
