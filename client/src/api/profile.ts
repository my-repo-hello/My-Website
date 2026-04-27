import api from './axios';

export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data: any) => api.put('/profile', data),
  uploadAvatar: (formData: FormData) =>
    api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/profile/password', data),
  getStats: () => api.get('/profile/stats'),
  updateSettings: (data: any) => api.put('/profile/settings', data),
  deleteAccount: (password: string) =>
    api.delete('/profile/account', { data: { password } }),
  getAllUsers: () => api.get('/profile/users'),
};

export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
};
