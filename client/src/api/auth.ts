import api from './axios';
import { LoginPayload, SignupPayload, IUser } from '@/types';

export const authAPI = {
  login: (data: LoginPayload) =>
    api.post<{ message: string; user: IUser }>('/auth/login', data),

  signup: (data: SignupPayload) =>
    api.post<{ message: string; user: IUser }>('/auth/signup', data),

  logout: () => api.post('/auth/logout'),

  getMe: () => api.get<{ user: IUser }>('/auth/me'),

  refreshToken: () => api.post('/auth/refresh'),

  checkEmail: (email: string) =>
    api.get<{ exists: boolean }>(`/auth/check-email/${email}`),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  verifyOTP: (email: string, otp: string) =>
    api.post<{ verified: boolean }>('/auth/verify-otp', { email, otp }),

  resetPassword: (email: string, otp: string, newPassword: string) =>
    api.post('/auth/reset-password', { email, otp, newPassword }),
};
