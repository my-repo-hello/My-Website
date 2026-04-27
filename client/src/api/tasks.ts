import api from './axios';

export const tasksAPI = {
  getAll: (params?: any) => api.get('/tasks', { params }),
  create: (data: any) => api.post('/tasks', data),
  get: (id: string) => api.get(`/tasks/${id}`),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  addComment: (id: string, text: string) =>
    api.post(`/tasks/${id}/comments`, { text }),
  updateStatus: (id: string, status: string) =>
    api.put(`/tasks/${id}/status`, { status }),
};
