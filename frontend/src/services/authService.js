import api from './api';

const getScope = () => {
  const isAdminPath = window.location.pathname.startsWith('/admin');
  return isAdminPath ? 'admin' : 'public';
};

const tokenKey = (scope) => `${scope}Token`;
const userKey = (scope) => `${scope}User`;

export const login = async (email, password, scope = getScope()) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem(tokenKey(scope), data.token);
  localStorage.setItem(userKey(scope), JSON.stringify(data.user));
  return data;
};

export const register = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

export const logout = (scope = getScope()) => {
  localStorage.removeItem(tokenKey(scope));
  localStorage.removeItem(userKey(scope));
};

export const getCurrentUser = (scope = getScope()) => {
  const user = localStorage.getItem(userKey(scope));
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = (scope = getScope()) => {
  return !!localStorage.getItem(tokenKey(scope));
};

export const isAdmin = () => {
  return getCurrentUser('admin')?.role === 'admin';
};

export const getLoginHistory = async (params = {}) => {
  const { page = 1, limit = 20 } = params;
  const { data } = await api.get('/auth/history', {
    params: { page, limit },
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
  });
  return data;
};

export const getMyReports = async () => {
  const token = localStorage.getItem(tokenKey(getScope()));
  const { data } = await api.get('/reports/my-reports', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};