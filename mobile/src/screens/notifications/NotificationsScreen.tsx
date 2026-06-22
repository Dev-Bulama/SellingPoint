import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import apiClient from '../../api/client';
import { Notification } from '../../types';
import { COLORS, SIZES } from '../../constants';
import { formatDateTime } from '../../utils/currency';
import { useNotificationStore } from '../../store/notificationStore';

function typeIcon(type: string) {
  if (type === 'order') return 'cube-outline';
  if (type === 'promo') return 'pricetag-outline';
  if (type === 'payment') return 'card-outline';
  return 'notifications-outline';
}

export default function NotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Notification | null>(null);
  const { unreadCount, clearUnread, decrementUnread } = useNotificationStore();
  const [localUnread, setLocalUnread] = useState(0);

  const load = async () => {
    try {
      const res = await apiClient.get('/notifications');
      setNotifications(res.data.data);
      setLocalUnread(res.data.unread_count ?? 0);
    } catch {} finally { setLoading(false); }
  };

  const markAllRead = async () => {
    await apiClient.post('/notifications/mark-all-read');
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setLocalUnread(0);
    clearUnread();
  };

  const openNotification = async (item: Notification) => {
    setSelected(item);
    if (!item.is_read) {
      try {
        await apiClient.post(`/notifications/${item.id}/read`);
        setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, is_read: true } : n));
        setLocalUnread(p => Math.max(0, p - 1));
        decrementUnread();
      } catch {}
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      {/* Detail modal */}
      <Modal
        visible={!!selected}
        animationType="slide"
        transparent
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIconWrap, { backgroundColor: COLORS.primary + '18' }]}>
              <IonIcon name={typeIcon(selected?.type ?? '')} size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.modalTitle}>{selected?.title}</Text>
            <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalBody}>{selected?.body}</Text>
            </ScrollView>
            <Text style={styles.modalTime}>{selected ? formatDateTime(selected.created_at) : ''}</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelected(null)}>
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <IonIcon name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Notifications{localUnread > 0 ? ` (${localUnread})` : ''}
        </Text>
        {localUnread > 0 ? (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 80 }} />}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: SIZES.screenPadding }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notifItem, !item.is_read && styles.unread]}
            onPress={() => openNotification(item)}
            activeOpacity={0.75}
          >
            <View style={[styles.notifIconWrap, { backgroundColor: COLORS.primary + '15' }]}>
              <IonIcon name={typeIcon(item.type)} size={22} color={COLORS.primary} />
            </View>
            <View style={styles.notifContent}>
              <Text style={[styles.notifTitle, !item.is_read && { fontWeight: '700' }]}>
                {item.title}
              </Text>
              <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
              <Text style={styles.notifTime}>{formatDateTime(item.created_at)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', justifyContent: 'center', gap: 6 }}>
              {!item.is_read && <View style={styles.unreadDot} />}
              <IonIcon name="chevron-forward" size={16} color={COLORS.textMuted} />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <IonIcon name="notifications-outline" size={64} color={COLORS.border} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySubtitle}>We'll notify you about orders, promos & more</Text>
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
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  markAllText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  notifItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius, padding: 14, marginBottom: 10,
    elevation: 1, borderWidth: 1, borderColor: COLORS.border,
  },
  unread: { borderLeftWidth: 3, borderLeftColor: COLORS.primary, borderColor: COLORS.primary + '40' },
  notifIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 3 },
  notifBody: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 11, color: COLORS.textMuted },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  modalCard: {
    backgroundColor: COLORS.white, borderRadius: 24, padding: 28,
    width: '100%', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 12,
  },
  modalIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: 12 },
  modalBody: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 12 },
  modalTime: { fontSize: 12, color: COLORS.textMuted, marginBottom: 20 },
  modalCloseBtn: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.borderRadius,
    paddingVertical: 13, paddingHorizontal: 40, alignItems: 'center',
  },
  modalCloseBtnText: { color: COLORS.white, fontSize: 15, fontWeight: 'bold' },
});
