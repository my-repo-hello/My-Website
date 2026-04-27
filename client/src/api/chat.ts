import api from './axios';

export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  createConversation: (data: any) => api.post('/chat/conversations', data),
  getMessages: (id: string, page?: number) =>
    api.get(`/chat/conversations/${id}/messages`, { params: { page, limit: 50 } }),
  sendMessage: (data: any) => api.post('/chat/messages', data),
  uploadFile: (formData: FormData) =>
    api.post('/chat/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getUsers: () => api.get('/chat/users'),
};
