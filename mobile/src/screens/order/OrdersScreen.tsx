import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { ordersApi } from '../../api/orders';
import { Order } from '../../types';
import { COLORS, SIZES, ORDER_STATUSES } from '../../constants';
import { formatCurrency, formatDate } from '../../utils/currency';

export default function OrdersScreen({ navigation }: any) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    try {
      const res = await ordersApi.list();
      setOrders(res.data.data);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadOrders(); }, []);

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: SIZES.screenPadding }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOrders(); }} colors={[COLORS.primary]} />}
        renderItem={({ item }) => {
          const status = ORDER_STATUSES[item.status as keyof typeof ORDER_STATUSES];
          return (
            <TouchableOpacity
              style={styles.orderCard}
              onPress={() => navigation.navigate('OrderDetail', { orderNumber: item.order_number })}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>{item.order_number}</Text>
                <View style={[styles.statusBadge, { backgroundColor: status?.color + '20' }]}>
                  <Text style={[styles.statusText, { color: status?.color }]}>{status?.label}</Text>
                </View>
              </View>
              <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
              <Text style={styles.orderItems}>{item.items?.length ?? 0} item(s)</Text>
              <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>{formatCurrency(item.total)}</Text>
                <Text style={styles.viewDetails}>View Details →</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySub}>Start shopping to see your orders here</Text>
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
  backBtn: { padding: 4 },
  backText: { fontSize: 22, color: COLORS.text },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  orderCard: {
    backgroundColor: COLORS.white, borderRadius: SIZES.borderRadius,
    padding: SIZES.screenPadding, marginBottom: 12, elevation: 1,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderNumber: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },
  orderDate: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  orderItems: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotal: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  viewDetails: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.textSecondary },
});
