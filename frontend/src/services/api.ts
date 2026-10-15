import axios from 'axios';

let rawBase = (import.meta.env.VITE_API_URL || '').trim();
if (rawBase && !rawBase.startsWith('http://') && !rawBase.startsWith('https://')) {
  rawBase = `https://${rawBase}`;
}

const apiBaseUrl = rawBase ? `${rawBase.replace(/\/$/, '')}/api/v1` : '/api/v1';

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hopebi_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 unauthorized and token was expired/invalid, clear local token
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('hopebi_token')) {
        localStorage.removeItem('hopebi_token');
        localStorage.removeItem('hopebi_user');
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.href = `/login?expired=true&from=${encodeURIComponent(window.location.pathname)}`;
        }
      }
    }
    return Promise.reject(error);
  }
);
