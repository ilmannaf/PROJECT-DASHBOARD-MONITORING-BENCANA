import api from './api';

export const getPosko = async () => {
  const { data } = await api.get('/posko');
  return data;
};

export const createPosko = async (payload) => {
  const { data } = await api.post('/posko', payload);
  return data;
};

export const updatePosko = async (id, payload) => {
  const { data } = await api.put(`/posko/${id}`, payload);
  return data;
};

export const deletePosko = async (id) => {
  const { data } = await api.delete(`/posko/${id}`);
  return data;
};