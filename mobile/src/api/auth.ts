import apiClient from './client';
import { User } from '../types';

export const authApi = {
  register: (data: { name: string; email: string; phone?: string; password: string; password_confirmation: string }) =>
    apiClient.post<{ token: string; user: User; message: string }>('/auth/register', data),

  login: (email: string, password: string) =>
    apiClient.post<{ token: string; user: User; message: string }>('/auth/login', { email, password }),

  logout: () => apiClient.post('/auth/logout'),

  getProfile: () => apiClient.get<{ user: User }>('/auth/profile'),

  updateProfile: (data: FormData) =>
    apiClient.post('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  changePassword: (data: { current_password: string; password: string; password_confirmation: string }) =>
    apiClient.post('/auth/change-password', data),

  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (data: { email: string; otp: string; password: string; password_confirmation: string }) =>
    apiClient.post('/auth/reset-password', data),
};
