import api from './api';

const unexpectedExpenditureService = {
  getUnexpectedExpenditures: async () => {
    const response = await api.get('/unexpected-expenditures');
    return response.data;
  },

  getUnexpectedExpenditureById: async (id) => {
    const response = await api.get(`/unexpected-expenditures/${id}`);
    return response.data;
  },

  createUnexpectedExpenditure: async (formData) => {
    const response = await api.post('/unexpected-expenditures', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateUnexpectedExpenditureStatus: async (id, data) => {
    const response = await api.patch(`/unexpected-expenditures/${id}/status`, data);
    return response.data;
  },

  deleteUnexpectedExpenditure: async (id) => {
    const response = await api.delete(`/unexpected-expenditures/${id}`);
    return response.data;
  },

  getUnexpectedExpenditureStats: async () => {
    const response = await api.get('/unexpected-expenditures/stats');
    return response.data;
  }
};

export default unexpectedExpenditureService;
