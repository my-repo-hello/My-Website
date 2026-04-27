import api from './axios';

export const notesAPI = {
  getAll: (params?: any) => api.get('/notes', { params }),
  create: (data: any) => api.post('/notes', data),
  update: (id: string, data: any) => api.put(`/notes/${id}`, data),
  delete: (id: string) => api.delete(`/notes/${id}`),
  togglePin: (id: string) => api.put(`/notes/${id}/pin`),
};
