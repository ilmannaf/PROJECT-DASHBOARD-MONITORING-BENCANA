import api from './api';

const bidang3Service = {
  // ========================================
  // AIR BERSIH
  // ========================================
  getAirBersihProposals: async () => {
    const response = await api.get('/bidang3/air-bersih');
    return response.data;
  },

  getAirBersihProposalById: async (id) => {
    const response = await api.get(`/bidang3/air-bersih/${id}`);
    return response.data;
  },

  createAirBersihProposal: async (data) => {
    const response = await api.post('/bidang3/air-bersih', data);
    return response.data;
  },

  updateAirBersihStatus: async (id, data) => {
    const response = await api.patch(`/bidang3/air-bersih/${id}/status`, data);
    return response.data;
  },

  deleteAirBersihProposal: async (id) => {
    const response = await api.delete(`/bidang3/air-bersih/${id}`);
    return response.data;
  },

  // ========================================
  // BANSOS
  // ========================================
  getBansosProposals: async () => {
    const response = await api.get('/bidang3/bansos');
    return response.data;
  },

  getBansosProposalById: async (id) => {
    const response = await api.get(`/bidang3/bansos/${id}`);
    return response.data;
  },

  createBansosProposal: async (formData) => {
    const response = await api.post('/bidang3/bansos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateBansosStatus: async (id, data) => {
    const response = await api.patch(`/bidang3/bansos/${id}/status`, data);
    return response.data;
  },

  deleteBansosProposal: async (id) => {
    const response = await api.delete(`/bidang3/bansos/${id}`);
    return response.data;
  },

  // ========================================
  // INFRASTRUKTUR
  // ========================================
  getInfrastrukturProposals: async () => {
    const response = await api.get('/bidang3/infrastruktur');
    return response.data;
  },

  getInfrastrukturProposalById: async (id) => {
    const response = await api.get(`/bidang3/infrastruktur/${id}`);
    return response.data;
  },

  createInfrastrukturProposal: async (data) => {
    const response = await api.post('/bidang3/infrastruktur', data);
    return response.data;
  },

  updateInfrastrukturStatus: async (id, data) => {
    const response = await api.patch(`/bidang3/infrastruktur/${id}/status`, data);
    return response.data;
  },

  deleteInfrastrukturProposal: async (id) => {
    const response = await api.delete(`/bidang3/infrastruktur/${id}`);
    return response.data;
  },

  // ========================================
  // SURVEY
  // ========================================
  getSurveys: async (params = {}) => {
    const response = await api.get('/bidang3/surveys', { params });
    return response.data;
  },

  createSurvey: async (formData) => {
    const response = await api.post('/bidang3/surveys', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateSurvey: async (id, formData) => {
    const response = await api.patch(`/bidang3/surveys/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // ========================================
  // STATISTIK
  // ========================================
  getBidang3Stats: async () => {
    const response = await api.get('/bidang3/stats');
    return response.data;
  }
};

export default bidang3Service;
