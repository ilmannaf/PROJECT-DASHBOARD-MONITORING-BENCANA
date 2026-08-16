import api from './api';

export const getVehicles = async (filters = {}) => {
  const { data } = await api.get('/vehicles', { params: filters });
  return data;
};

export const createVehicle = async (payload) => {
  const { data } = await api.post('/vehicles', payload);
  return data;
};

export const updateVehicle = async (id, payload) => {
  const { data } = await api.patch(`/vehicles/${id}`, payload);
  return data;
};

export const deleteVehicle = async (id) => {
  const { data } = await api.delete(`/vehicles/${id}`);
  return data;
};