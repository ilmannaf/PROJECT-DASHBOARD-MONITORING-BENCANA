import api from './api';

export const getPosko = async () => {
  const { data } = await api.get('/posko');
  return data;
};

export const createPosko = async (payload) => {
  const { data } = await api.post('/posko', payload);
  return data;
};