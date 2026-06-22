import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES, ORDER_STATUSES } from '../../constants';
import apiClient from '../../api/client';
import { Order } from '../../types';
import { formatCurrency } from '../../utils/currency';

const STATUS_TIMELINE = [
  { key: 'pending',    label: 'Order Placed',    icon: 'receipt-outline' },
  { key: 'confirmed',  label: 'Confirmed',        icon: 'checkmark-circle-outline' },
  { key: 'processing', label: 'Processing',       icon: 'construct-outline' },
  { key: 'shipped',    label: 'Shipped',          icon: 'cube-outline' },
  { key: 'delivered',  label: 'Delivered',        icon: 'home-outline' },
];

const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

function TimelineStep({ step, isCurrent, isDone }: { step: any; isCurrent: boolean; isDone: boolean }) {
  const color = isDone ? COLORS.success : isCurrent ? COLORS.primary : COLORS.grayMedium;
  return (
    <View style={styles.timelineStep}>
      <View style={[styles.timelineIcon, { backgroundColor: isDone || isCurrent ? color : COLORS.grayLight, borderColor: color }]}>
        <IonIcon name={step.icon} size={16} color={isDone || isCurrent ? COLORS.white : COLORS.gray} />
      </View>
      <Text style={[styles.timelineLabel, { color: isDone || isCurrent ? COLORS.text : COLORS.gray }]}>
        {step.label}
      </Text>
    </View>
  );
}

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const statusConfig = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || { label: order.status, color: COLORS.gray };
  const currentIdx = STATUS_ORDER.indexOf(order.status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>Order #{order.order_number}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
          <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
        </View>
      </View>

      <View style={styles.timelineRow}>
        {STATUS_TIMELINE.map((step, i) => (
          <React.Fragment key={step.key}>
            <TimelineStep
              step={step}
              isCurrent={i === currentIdx}
              isDone={i < currentIdx}
            />
            {i < STATUS_TIMELINE.length - 1 && (
              <View style={[styles.timelineLine, { backgroundColor: i < currentIdx ? COLORS.success : COLORS.grayMedium }]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.itemCount}>{order.items?.length ?? 0} item(s)</Text>
        <Text style={styles.total}>{formatCurrency(order.total)}</Text>
      </View>
      <Text style={styles.date}>{new Date(order.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}</Text>
    </TouchableOpacity>
  );
}

export default function OrderTrackingScreen({ navigation }: any) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadOrders = useCallback(async (reset = false) => {
    try {
      const currentPage = reset ? 1 : page;
      const res = await apiClient.get('/orders', { params: { page: currentPage, per_page: 10 } });
      const newOrders: Order[] = res.data.data?.data ?? res.data.data ?? [];
      if (reset) {
        setOrders(newOrders);
        setPage(2);
      } else {
        setOrders(prev => [...prev, ...newOrders]);
        setPage(p => p + 1);
      }
      const meta = res.data.data?.meta;
      setHasMore(meta ? meta.current_page < meta.last_page : newOrders.length === 10);
    } catch {
      // silent — show empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  useEffect(() => { loadOrders(true); }, []);

  const onRefresh = () => { setRefreshing(true); loadOrders(true); };

  const filtered = searchQuery.trim()
    ? orders.filter(o => o.order_number.toLowerCase().includes(searchQuery.toLowerCase()))
    : orders;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}><Text style={styles.headerTitle}>My Orders</Text></View>
        <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      <View style={styles.searchBar}>
        <IonIcon name="search-outline" size={18} color={COLORS.gray} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by order number..."
            placeholderTextColor="#BDBDBD"
          placeholderTextColor={COLORS.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IonIcon name="close-circle" size={18} color={COLORS.gray} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={() => navigation.navigate('OrderDetail', { orderNumber: item.order_number })} />
        )}
        contentContainerStyle={{ padding: SIZES.screenPadding, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <IonIcon name="receipt-outline" size={64} color={COLORS.grayMedium} />
            <Text style={styles.emptyTitle}>{searchQuery ? 'No orders found' : 'No orders yet'}</Text>
            <Text style={styles.emptySubtitle}>{searchQuery ? 'Try a different order number' : 'Your orders will appear here after purchase'}</Text>
            {!searchQuery && (
              <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('HomeTab')}>
                <Text style={styles.shopBtnText}>Start Shopping</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        onEndReached={() => { if (hasMore && !loading) loadOrders(false); }}
        onEndReachedThreshold={0.3}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SIZES.screenPadding, paddingVertical: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, margin: SIZES.screenPadding, borderRadius: SIZES.borderRadius, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  card: { backgroundColor: COLORS.white, borderRadius: SIZES.borderRadius, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  orderNumber: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },
  timelineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  timelineStep: { alignItems: 'center', flex: 1 },
  timelineIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginBottom: 4 },
  timelineLabel: { fontSize: 9, textAlign: 'center', fontWeight: '500' },
  timelineLine: { height: 2, flex: 1, marginBottom: 20, marginHorizontal: -4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, marginTop: 4 },
  itemCount: { fontSize: 13, color: COLORS.textSecondary },
  total: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  date: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 },
  shopBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: SIZES.borderRadius },
  shopBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
});
