import api from './api';

export const getItems = async (filters = {}) => {
  const { data } = await api.get('/inventory', { params: filters });
  return data;
};

export const createItem = async (payload) => {
  const { data } = await api.post('/inventory', payload);
  return data;
};

export const updateItem = async (id, payload) => {
  const { data } = await api.patch(`/inventory/${id}`, payload);
  return data;
};

export const deleteItem = async (id) => {
  const { data } = await api.delete(`/inventory/${id}`);
  return data;
};