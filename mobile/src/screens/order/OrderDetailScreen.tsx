import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { usePaystack } from 'react-native-paystack-webview';
import { ordersApi } from '../../api/orders';
import { paymentsApi } from '../../api/payments';
import { Order } from '../../types';
import { COLORS, SIZES, ORDER_STATUSES, PAYMENT_STATUSES } from '../../constants';
import { formatCurrency, formatDateTime } from '../../utils/currency';
import { useAuthStore } from '../../store/authStore';
import AppAlert from '../../components/AppAlert';

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailScreen({ route, navigation }: any) {
  const { orderNumber } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const paystackRefRef = useRef('');
  const { user } = useAuthStore();
  const { popup } = usePaystack();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertProps, setAlertProps] = useState<{
    icon: string; iconColor: string; title: string; message: string;
    buttons?: { text: string; onPress?: () => void; style?: 'primary' | 'outline' }[];
  }>({ icon: '', iconColor: '', title: '', message: '' });

  const showAlert = (
    icon: string, iconColor: string, title: string, message: string,
    buttons?: { text: string; onPress?: () => void; style?: 'primary' | 'outline' }[],
  ) => {
    setAlertProps({ icon, iconColor, title, message, buttons });
    setAlertVisible(true);
  };

  useEffect(() => {
    ordersApi.show(orderNumber).then(res => setOrder(res.data.data)).catch(() => navigation.goBack()).finally(() => setLoading(false));
  }, [orderNumber]);

  const handleCompletePayment = () => {
    if (!order) return;
    const reference = `SP_${order.order_number}_${Date.now()}`;
    paystackRefRef.current = reference;
    popup.checkout({
      email: user?.email ?? '',
      amount: order.total,
      reference,
      metadata: { order_number: order.order_number, user_id: user?.id },
      onSuccess: async () => {
        setPaying(true);
        try {
          await paymentsApi.verify(paystackRefRef.current, order.order_number);
          setOrder(prev => prev ? { ...prev, payment_status: 'paid' } : prev);
          showAlert('checkmark-circle', COLORS.success, 'Payment Successful', 'Your payment has been confirmed.');
        } catch {
          showAlert('warning-outline', COLORS.danger, 'Verification Error',
            'Payment received but could not be confirmed automatically. Please contact support with reference: ' + paystackRefRef.current);
        } finally { setPaying(false); }
      },
      onCancel: () => {
        showAlert('information-circle', COLORS.primary, 'Payment Cancelled', 'You can try again anytime from this page.');
      },
    });
  };

  const handleCancel = () => {
    showAlert('close-circle', COLORS.danger, 'Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'outline', onPress: () => setAlertVisible(false) },
      {
        text: 'Yes, Cancel', style: 'primary', onPress: async () => {
          setAlertVisible(false);
          await ordersApi.cancel(orderNumber, 'Customer requested cancellation');
          setOrder(prev => prev ? { ...prev, status: 'cancelled' } : prev);
        },
      },
    ]);
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!order) return null;

  const status = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES];
  const payStatus = PAYMENT_STATUSES[order.payment_status as keyof typeof PAYMENT_STATUSES];
  const currentStep = STEPS.indexOf(order.status);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <AppAlert
        visible={alertVisible}
        icon={alertProps.icon}
        iconColor={alertProps.iconColor}
        title={alertProps.title}
        message={alertProps.message}
        buttons={alertProps.buttons}
        onDismiss={() => setAlertVisible(false)}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><IonIcon name="arrow-back" size={22} color={COLORS.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Status */}
      <View style={styles.statusCard}>
        <Text style={styles.orderNum}>{order.order_number}</Text>
        <Text style={styles.orderDate}>{formatDateTime(order.created_at)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: status?.color + '20' }]}>
          <Text style={[styles.statusText, { color: status?.color }]}>{status?.label}</Text>
        </View>
      </View>

      {/* Progress Tracker */}
      {order.status !== 'cancelled' && order.status !== 'refunded' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Progress</Text>
          <View style={styles.tracker}>
            {STEPS.map((step, i) => (
              <View key={step} style={styles.stepItem}>
                <View style={[styles.stepCircle, i <= currentStep && styles.activeStepCircle]}>
                  {i <= currentStep
                    ? <IonIcon name="checkmark" size={14} color="white" />
                    : <Text style={styles.stepIcon}>{String(i + 1)}</Text>}
                </View>
                <Text style={[styles.stepLabel, i <= currentStep && styles.activeStepLabel]}>
                  {ORDER_STATUSES[step as keyof typeof ORDER_STATUSES]?.label}
                </Text>
                {i < STEPS.length - 1 && <View style={[styles.stepLine, i < currentStep && styles.activeStepLine]} />}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Payment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment</Text>
        <View style={styles.infoCard}>
          <View style={styles.row}><Text style={styles.rowLabel}>Method</Text><Text style={styles.rowValue}>{order.payment_method === 'paystack' ? 'Paystack' : 'Cash on Delivery'}</Text></View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Status</Text>
            <View style={[styles.payBadge, { backgroundColor: payStatus?.color + '20' }]}>
              <Text style={[styles.payBadgeText, { color: payStatus?.color }]}>{payStatus?.label}</Text>
            </View>
          </View>
          {order.payment?.reference && <View style={styles.row}><Text style={styles.rowLabel}>Reference</Text><Text style={styles.rowValue}>{order.payment.reference}</Text></View>}
        </View>
      </View>

      {/* Delivery */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <View style={styles.infoCard}>
          <Text style={styles.addrName}>{order.delivery.name} · {order.delivery.phone}</Text>
          <Text style={styles.addrText}>{order.delivery.address}</Text>
          <Text style={styles.addrText}>{order.delivery.city}, {order.delivery.state}</Text>
        </View>
      </View>

      {/* Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.items.map(item => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemImage}><IonIcon name="bag-outline" size={28} color={COLORS.textMuted} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.product_name}</Text>
              {item.variant_name && <Text style={styles.itemVariant}>{item.variant_name}</Text>}
              <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.itemTotal}>{formatCurrency(item.total_price)}</Text>
          </View>
        ))}
      </View>

      {/* Price Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price Summary</Text>
        <View style={styles.infoCard}>
          <View style={styles.row}><Text style={styles.rowLabel}>Subtotal</Text><Text style={styles.rowValue}>{formatCurrency(order.subtotal)}</Text></View>
          <View style={styles.row}><Text style={styles.rowLabel}>Shipping</Text><Text style={styles.rowValue}>{formatCurrency(order.shipping_fee)}</Text></View>
          {order.discount_amount > 0 && <View style={styles.row}><Text style={[styles.rowLabel, { color: COLORS.success }]}>Discount</Text><Text style={[styles.rowValue, { color: COLORS.success }]}>-{formatCurrency(order.discount_amount)}</Text></View>}
          <View style={[styles.row, { borderTopWidth: 1, borderTopColor: COLORS.divider, marginTop: 4, paddingTop: 12 }]}>
            <Text style={[styles.rowLabel, { fontWeight: 'bold', fontSize: 15 }]}>Total</Text>
            <Text style={[styles.rowValue, { fontWeight: 'bold', fontSize: 16, color: COLORS.primary }]}>{formatCurrency(order.total)}</Text>
          </View>
        </View>
      </View>

      {/* Complete Payment */}
      {order.payment_status === 'unpaid' && order.payment_method === 'paystack' && order.status !== 'cancelled' && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.payBtn} onPress={handleCompletePayment} disabled={paying}>
            {paying
              ? <ActivityIndicator color={COLORS.white} />
              : <>
                  <IonIcon name="card-outline" size={18} color={COLORS.white} style={{ marginRight: 8 }} />
                  <Text style={styles.payBtnText}>Complete Payment</Text>
                </>
            }
          </TouchableOpacity>
        </View>
      )}

      {/* Cancel */}
      {['pending', 'confirmed'].includes(order.status) && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>Cancel Order</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.screenPadding, paddingTop: 48, paddingBottom: 16, backgroundColor: COLORS.white },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text },
  statusCard: { backgroundColor: COLORS.white, padding: SIZES.screenPadding, marginBottom: 12, alignItems: 'center' },
  orderNum: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  orderDate: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 12 },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 14, fontWeight: 'bold' },
  section: { backgroundColor: COLORS.white, marginBottom: 12, padding: SIZES.screenPadding },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  tracker: { flexDirection: 'row', alignItems: 'flex-start' },
  stepItem: { flex: 1, alignItems: 'center', position: 'relative' },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.grayMedium, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  activeStepCircle: { backgroundColor: COLORS.primary },
  stepIcon: { fontSize: 12, color: COLORS.white, fontWeight: 'bold' },
  stepLabel: { fontSize: 10, color: COLORS.textMuted, textAlign: 'center' },
  activeStepLabel: { color: COLORS.primary, fontWeight: '600' },
  stepLine: { position: 'absolute', top: 14, left: '50%', right: '-50%', height: 2, backgroundColor: COLORS.grayMedium, zIndex: -1 },
  activeStepLine: { backgroundColor: COLORS.primary },
  infoCard: { backgroundColor: COLORS.grayLight, borderRadius: SIZES.borderRadiusSm, padding: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  rowLabel: { fontSize: 14, color: COLORS.textSecondary },
  rowValue: { fontSize: 14, color: COLORS.text, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  payBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  payBadgeText: { fontSize: 12, fontWeight: '600' },
  addrName: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  addrText: { fontSize: 13, color: COLORS.textSecondary },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  itemImage: { width: 56, height: 56, borderRadius: 8, backgroundColor: COLORS.grayLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  itemName: { fontSize: 13, fontWeight: '500', color: COLORS.text, marginBottom: 2 },
  itemVariant: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 },
  itemQty: { fontSize: 12, color: COLORS.textSecondary },
  itemTotal: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
  payBtn: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.borderRadius,
    paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    elevation: 2, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3,
  },
  payBtnText: { color: COLORS.white, fontSize: 15, fontWeight: 'bold' },
  cancelBtn: { borderWidth: 1.5, borderColor: COLORS.danger, borderRadius: SIZES.borderRadius, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { color: COLORS.danger, fontSize: 15, fontWeight: 'bold' },
});
