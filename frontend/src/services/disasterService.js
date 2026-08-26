import api from './api';

export const getDisasterRecords = async () => {
  const { data } = await api.get('/disaster-records');
  return data;
};

export const getDisasterRecordById = async (id) => {
  const { data } = await api.get(`/disaster-records/${id}`);
  return data;
};

export const createDisasterRecord = async (formData) => {
  const { data } = await api.post('/disaster-records', formData);
  return data;
};

export const updateDisasterRecord = async (id, payload) => {
  const { data } = await api.put(`/disaster-records/${id}`, payload);
  return data;
};

export const deleteDisasterRecord = async (id) => {
  const { data } = await api.delete(`/disaster-records/${id}`);
  return data;
};

export const downloadDisasterPdf = async (id) => {
  const res = await api.get(`/disaster-records/${id}/pdf`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = `pendataan-bencana-${id}.pdf`;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const exportDisasterRecordsExcel = async (filters = {}) => {
  const res = await api.get('/disaster-records/export', { params: filters, responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'pendataan-bencana.xlsx';
  link.click();
  window.URL.revokeObjectURL(url);
};
