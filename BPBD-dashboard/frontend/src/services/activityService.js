import api from './api';

export const getActivities = async () => {
  const { data } = await api.get('/activities');
  return data;
};

export const createActivity = async (formData) => {
  const { data } = await api.post('/activities', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteActivity = async (id) => {
  const { data } = await api.delete(`/activities/${id}`);
  return data;
};