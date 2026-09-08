import api from './api';

const waterDistributionService = {
  getWaterDistributions: async () => {
    const response = await api.get('/water-distributions');
    return response.data;
  },

  getWaterDistributionById: async (id) => {
    const response = await api.get(`/water-distributions/${id}`);
    return response.data;
  },

  createWaterDistribution: async (data) => {
    const response = await api.post('/water-distributions', data);
    return response.data;
  },

  updateWaterDistributionStatus: async (id, data) => {
    const response = await api.patch(`/water-distributions/${id}/status`, data);
    return response.data;
  },

  deleteWaterDistribution: async (id) => {
    const response = await api.delete(`/water-distributions/${id}`);
    return response.data;
  },

  getWaterDistributionStats: async () => {
    const response = await api.get('/water-distributions/stats');
    return response.data;
  }
};

export default waterDistributionService;
