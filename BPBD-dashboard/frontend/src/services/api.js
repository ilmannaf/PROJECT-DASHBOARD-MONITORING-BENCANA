import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const scope = window.location.pathname.startsWith('/admin') ? 'admin' : 'public';
  const token = localStorage.getItem(`${scope}Token`);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    if (error.response?.status === 403 && !isAuthEndpoint) {
      alert(error.response.data?.message || 'Akses ditolak');
    }
    return Promise.reject(error);
  },
);

export default api;