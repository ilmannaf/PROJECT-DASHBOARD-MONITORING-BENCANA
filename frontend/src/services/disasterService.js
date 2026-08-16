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
