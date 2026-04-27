import api from './axios';

export const habitsAPI = {
  getAll: () => api.get('/habits'),
  create: (data: any) => api.post('/habits', data),
  update: (id: string, data: any) => api.put(`/habits/${id}`, data),
  delete: (id: string) => api.delete(`/habits/${id}`),
  toggleLog: (id: string) => api.post(`/habits/${id}/log`),
  getCalendar: (month: string) => api.get(`/habits/calendar/${month}`),
  getAnalytics: () => api.get('/habits/analytics'),
};
