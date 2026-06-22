import { create } from 'zustand';
import apiClient from '../api/client';

interface NotificationStore {
  unreadCount: number;
  fetchUnreadCount: () => Promise<void>;
  decrementUnread: (by?: number) => void;
  clearUnread: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,

  fetchUnreadCount: async () => {
    try {
      const res = await apiClient.get('/notifications');
      set({ unreadCount: res.data.unread_count ?? 0 });
    } catch {}
  },

  decrementUnread: (by = 1) =>
    set(s => ({ unreadCount: Math.max(0, s.unreadCount - by) })),

  clearUnread: () => set({ unreadCount: 0 }),
}));
