import api from './api';

const bttPenerimaService = {
  getBttPenerimaByBttId: async (bttId) => {
    const response = await api.get(`/btt-penerima/btt/${bttId}`);
    return response.data;
  },

  getBttPenerimaById: async (id) => {
    const response = await api.get(`/btt-penerima/${id}`);
    return response.data;
  },

  createBttPenerima: async (data) => {
    const response = await api.post('/btt-penerima', data);
    return response.data;
  },

  updateBttPenerima: async (id, data) => {
    const response = await api.put(`/btt-penerima/${id}`, data);
    return response.data;
  },

  deleteBttPenerima: async (id) => {
    const response = await api.delete(`/btt-penerima/${id}`);
    return response.data;
  },

  exportBttPenerima: async () => {
    const response = await api.get('/btt-penerima/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rekapan-penerima-bantuan-btt.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);
  }
};

export default bttPenerimaService;
