import api from './api';

export const getMyProfile = async () => {
  const { data } = await api.get('/profile/me');
  return data;
};

export const updateMyProfile = async (formData) => {
  const { data } = await api.put('/profile/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getAllPetugasProfiles = async () => {
  const { data } = await api.get('/profile/petugas');
  return data;
};

export const getPetugasProfile = async (id) => {
  const { data } = await api.get(`/profile/petugas/${id}`);
  return data;
};
