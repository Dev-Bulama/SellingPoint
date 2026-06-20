import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import apiClient from '../../api/client';
import { Notification } from '../../types';
import { COLORS, SIZES } from '../../constants';
import { formatDateTime } from '../../utils/currency';

export default function NotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = async () => {
    try {
      const res = await apiClient.get('/notifications');
      setNotifications(res.data.data);
      setUnreadCount(res.data.unread_count);
    } catch {} finally { setLoading(false); }
  };

  const markAllRead = async () => {
    await apiClient.post('/notifications/mark-all-read');
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications {unreadCount > 0 && `(${unreadCount})`}</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: SIZES.screenPadding }}
        renderItem={({ item }) => (
          <View style={[styles.notifItem, !item.is_read && styles.unread]}>
            <View style={styles.notifIcon}>
              <Text style={{ fontSize: 24 }}>{item.type === 'order' ? '📦' : item.type === 'promo' ? '🏷️' : '🔔'}</Text>
            </View>
            <View style={styles.notifContent}>
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.notifBody}>{item.body}</Text>
              <Text style={styles.notifTime}>{formatDateTime(item.created_at)}</Text>
            </View>
            {!item.is_read && <View style={styles.unreadDot} />}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.screenPadding, paddingTop: 48, paddingBottom: 16,
    backgroundColor: COLORS.white,
  },
  backText: { fontSize: 22, color: COLORS.text },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  markAllText: { color: COLORS.primary, fontSize: 13 },
  notifItem: {
    flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: SIZES.borderRadius,
    padding: 14, marginBottom: 10, elevation: 1, position: 'relative',
  },
  unread: { borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  notifIcon: { marginRight: 12 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  notifBody: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4, lineHeight: 18 },
  notifTime: { fontSize: 11, color: COLORS.textMuted },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, alignSelf: 'center' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
});
