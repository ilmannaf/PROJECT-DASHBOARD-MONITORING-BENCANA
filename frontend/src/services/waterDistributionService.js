import api from './api';

const waterDistributionService = {
  getWaterDistributions: async () => {
    const { data } = await api.get('/water-distributions');
    return data;
  },

  getWaterDistributionById: async (id) => {
    const { data } = await api.get(`/water-distributions/${id}`);
    return data;
  },

  getDistributionSummary: async () => {
    const { data } = await api.get('/water-distributions/summary');
    return data;
  },

  exportWaterDistributionsExcel: async () => {
    const response = await api.get('/water-distributions/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'distribusi-air-bersih.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);
  },

  createWaterDistribution: async (payload) => {
    const { data } = await api.post('/water-distributions', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  updateWaterDistribution: async (id, payload) => {
    const { data } = await api.patch(`/water-distributions/${id}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deleteWaterDistribution: async (id) => {
    const { data } = await api.delete(`/water-distributions/${id}`);
    return data;
  },

  getSupplySettings: async () => {
    const { data } = await api.get('/water-supply-settings');
    return data;
  },

  updateSupplySettings: async (payload) => {
    const { data } = await api.put('/water-supply-settings', payload);
    return data;
  },
};

export default waterDistributionService;
