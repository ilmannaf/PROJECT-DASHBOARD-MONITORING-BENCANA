import api from './api';

export const getInfoBoard = async () => {
  const { data } = await api.get('/info-board');
  return data;
};

export const createInfoBoard = async (payload) => {
  const { data } = await api.post('/info-board', payload);
  return data;
};

export const updateInfoBoard = async (id, payload) => {
  const { data } = await api.patch(`/info-board/${id}`, payload);
  return data;
};

export const deleteInfoBoard = async (id) => {
  const { data } = await api.delete(`/info-board/${id}`);
  return data;
};
