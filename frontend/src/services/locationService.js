import api from './api';

export const getLocations = async (type) => {
  const { data } = await api.get(`/locations/${type}`);
  return data;
};

export const createLocation = async (type, payload) => {
  const { data } = await api.post(`/locations/${type}`, payload);
  return data;
};

export const updateLocation = async (type, id, payload) => {
  const { data } = await api.put(`/locations/${type}/${id}`, payload);
  return data;
};

export const deleteLocation = async (type, id) => {
  const { data } = await api.delete(`/locations/${type}/${id}`);
  return data;
};

export const exportLocations = async (type) => {
  const response = await api.get(`/locations/${type}/export`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${type}-lokasi.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
};
