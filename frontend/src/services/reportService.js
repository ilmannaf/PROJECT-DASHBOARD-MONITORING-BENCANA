import api from './api';

export const submitReport = async (formData) => {
  const { data } = await api.post('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getReports = async (filters = {}) => {
  const { data } = await api.get('/reports', { params: filters });
  return data;
};

export const trackReport = async (code) => {
  const { data } = await api.get(`/reports/track/${code}`);
  return data;
};

export const updateReportStatus = async (id, payload) => {
  const { data } = await api.patch(`/reports/${id}/status`, payload);
  return data;
};

export const getMyReports = async () => {
  const { data } = await api.get('/reports/my-reports');
  return data;
};

export const deleteReport = async (id) => {
  const { data } = await api.delete(`/reports/${id}`);
  return data;
};