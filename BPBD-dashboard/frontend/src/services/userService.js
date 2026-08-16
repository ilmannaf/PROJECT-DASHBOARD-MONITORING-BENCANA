import api from './api';

export const getUsers = async () => {
  const { data } = await api.get('/users');
  return data;
};

export const createUser = async (payload) => {
  const { data } = await api.post('/users', payload);
  return data;
};

export const resetPassword = async (id, password) => {
  const { data } = await api.patch(`/users/${id}/password`, { password });
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(`/users/${id}`);
  return data;
};