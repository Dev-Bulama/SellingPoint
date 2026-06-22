import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { authApi } from '../api/auth';
import { setAuthToken } from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  loadUser: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userStr = await AsyncStorage.getItem('user');
      if (token && userStr) {
        await setAuthToken(token); // warm up in-memory cache
        set({ token, user: JSON.parse(userStr), isAuthenticated: true });
        // Refresh user data from server (silently fail if offline or token expired)
        try {
          const res = await authApi.getProfile();
          const freshUser = res.data.user;
          await AsyncStorage.setItem('user', JSON.stringify(freshUser));
          set({ user: freshUser });
        } catch {}
      }
    } catch {}
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await authApi.login(email, password);
      const { token, user } = res.data;
      await setAuthToken(token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authApi.register(data);
      const { token, user } = res.data;
      await setAuthToken(token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try { await authApi.logout(); } catch {}
    await setAuthToken(null);
    await AsyncStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (user) => {
    set({ user });
    AsyncStorage.setItem('user', JSON.stringify(user));
  },
}));
