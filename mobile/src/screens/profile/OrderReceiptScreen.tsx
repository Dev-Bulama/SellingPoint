import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  StatusBar,
} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../../api/client';
import { COLORS, SIZES, ORDER_STATUSES, PAYMENT_STATUSES } from '../../constants';
import { Order } from '../../types';

function formatPrice(amount: number) {
  return `₦${amount.toLocaleString('en-NG')}`;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status, type }: { status: string; type: 'order' | 'payment' }) {
  const map = type === 'order' ? ORDER_STATUSES : PAYMENT_STATUSES;
  const entry = (map as any)[status] ?? { label: status, color: COLORS.gray };
  return (
    <View style={[styles.badge, { backgroundColor: entry.color + '20' }]}>
      <Text style={[styles.badgeText, { color: entry.color }]}>{entry.label}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function DashedLine() {
  return <View style={styles.dashedLine} />;
}

export default function OrderReceiptScreen({ route, navigation }: any) {
  const { orderNumber } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/orders/${orderNumber}`);
      setOrder(res.data?.data ?? res.data);
    } catch {
      setError('Failed to load receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderNumber]);

  const handleShare = async () => {
    if (!order) return;
    try {
      const itemLines = order.items
        .map(i => `  - ${i.product_name} x${i.quantity}  ${formatPrice(i.total_price)}`)
        .join('\n');

      await Share.share({
        title: `Order Receipt - ${order.order_number}`,
        message: [
          '===== SELLINGPOINT RECEIPT =====',
          `Order #: ${order.order_number}`,
          `Date: ${formatDate(order.created_at)}`,
          `Status: ${order.status.toUpperCase()}`,
          '',
          'ITEMS:',
          itemLines,
          '',
          `Subtotal:  ${formatPrice(order.subtotal)}`,
          `Shipping:  ${formatPrice(order.shipping_fee)}`,
          order.discount_amount > 0 ? `Discount:  -${formatPrice(order.discount_amount)}` : '',
          `TOTAL:     ${formatPrice(order.total)}`,
          '',
          `Payment: ${order.payment_method} (${order.payment_status})`,
          '================================',
        ]
          .filter(Boolean)
          .join('\n'),
      });
    } catch {}
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading receipt...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
            <IonIcon name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Receipt</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <IonIcon name="warning" size={48} color="orange" style={{ marginBottom: SIZES.base }} />
          <Text style={styles.errorText}>{error ?? 'Order not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrder}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Sticky header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <IonIcon name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Receipt</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareHeaderButton}>
          <IonIcon name="share-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          {/* Logo & Branding */}
          <View style={styles.receiptLogo}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>SP</Text>
            </View>
            <Text style={styles.brandName}>SellingPoint</Text>
            <Text style={styles.receiptLabel}>Order Receipt</Text>
          </View>

          <DashedLine />

          {/* Order Info */}
          <View style={styles.receiptSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order Number</Text>
              <Text style={styles.infoValueBold}>#{order.order_number}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatDate(order.created_at)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order Status</Text>
              <StatusBadge status={order.status} type="order" />
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment Status</Text>
              <StatusBadge status={order.payment_status} type="payment" />
            </View>
          </View>

          <DashedLine />

          {/* Items Table */}
          <View style={styles.receiptSection}>
            <Text style={styles.sectionTitle}>Items Ordered</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Item</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Qty</Text>
              <Text style={[styles.tableHeaderText, { flex: 2, textAlign: 'right' }]}>Price</Text>
            </View>
            <Divider />
            {order.items.map((item, index) => (
              <View key={item.id}>
                <View style={styles.tableRow}>
                  <View style={{ flex: 3 }}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.product_name}</Text>
                    {item.variant_name && (
                      <Text style={styles.itemVariant}>{item.variant_name}</Text>
                    )}
                  </View>
                  <Text style={[styles.itemQty, { flex: 1, textAlign: 'center' }]}>
                    ×{item.quantity}
                  </Text>
                  <Text style={[styles.itemPrice, { flex: 2, textAlign: 'right' }]}>
                    {formatPrice(item.total_price)}
                  </Text>
                </View>
                {index < order.items.length - 1 && <Divider />}
              </View>
            ))}
          </View>

          <DashedLine />

          {/* Totals */}
          <View style={styles.receiptSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatPrice(order.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping</Text>
              <Text style={styles.totalValue}>
                {order.shipping_fee === 0 ? 'Free' : formatPrice(order.shipping_fee)}
              </Text>
            </View>
            {order.discount_amount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}
                </Text>
                <Text style={[styles.totalValue, { color: COLORS.success }]}>
                  -{formatPrice(order.discount_amount)}
                </Text>
              </View>
            )}
            {order.tax_amount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax</Text>
                <Text style={styles.totalValue}>{formatPrice(order.tax_amount)}</Text>
              </View>
            )}
            <Divider />
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{formatPrice(order.total)}</Text>
            </View>
          </View>

          <DashedLine />

          {/* Payment Method */}
          <View style={styles.receiptSection}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Method</Text>
              <Text style={styles.infoValue}>{order.payment_method.replace(/_/g, ' ')}</Text>
            </View>
            {order.payment?.reference && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Reference</Text>
                <Text style={styles.infoValue}>{order.payment.reference}</Text>
              </View>
            )}
            {order.payment?.paid_at && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Paid at</Text>
                <Text style={styles.infoValue}>{formatDate(order.payment.paid_at)}</Text>
              </View>
            )}
          </View>

          <DashedLine />

          {/* Delivery Address */}
          <View style={styles.receiptSection}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <Text style={styles.addressText}>{order.delivery.name}</Text>
            <Text style={styles.addressText}>{order.delivery.phone}</Text>
            <Text style={styles.addressText}>{order.delivery.address}</Text>
            <Text style={styles.addressText}>
              {order.delivery.city}, {order.delivery.state}, {order.delivery.country}
            </Text>
          </View>

          {/* Thank you note */}
          <View style={styles.thankYouContainer}>
            <Text style={styles.thankYouText}>Thank you for shopping with us!</Text>
          </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.85}>
          <Text style={styles.shareButtonText}>Share Receipt</Text>
        </TouchableOpacity>

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBack: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerBackIcon: { fontSize: 22, color: COLORS.text, fontWeight: '600' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: COLORS.text },
  headerSpacer: { width: 36 },
  shareHeaderButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  shareHeaderIcon: { fontSize: 18 },
  scroll: { flex: 1 },
  scrollContent: { padding: SIZES.screenPadding },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: SIZES.sm, color: COLORS.textSecondary, fontSize: 14 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SIZES.screenPadding * 2 },
  errorIcon: { fontSize: 48, marginBottom: SIZES.base },
  errorText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SIZES.xl },
  retryButton: {
    backgroundColor: COLORS.primary, paddingHorizontal: SIZES.xl, paddingVertical: SIZES.sm,
    borderRadius: SIZES.borderRadius,
  },
  retryButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
  receiptCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginBottom: SIZES.base,
  },
  receiptLogo: { alignItems: 'center', paddingVertical: SIZES.xl, backgroundColor: COLORS.white },
  logoCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: SIZES.xs,
  },
  logoText: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
  brandName: { fontSize: 18, fontWeight: '800', color: COLORS.secondary, letterSpacing: 0.5 },
  receiptLabel: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  dashedLine: {
    height: 1,
    marginHorizontal: SIZES.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderStyle: 'dashed',
  },
  divider: { height: 1, backgroundColor: COLORS.divider },
  receiptSection: { padding: SIZES.screenPadding },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SIZES.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.sm },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary, flex: 1 },
  infoValue: { fontSize: 14, color: COLORS.text, fontWeight: '500', textAlign: 'right', flex: 1 },
  infoValueBold: { fontSize: 14, color: COLORS.text, fontWeight: '700', textAlign: 'right' },
  badge: { borderRadius: SIZES.borderRadiusSm, paddingHorizontal: SIZES.sm, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  tableHeader: { flexDirection: 'row', marginBottom: SIZES.xs },
  tableHeaderText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: SIZES.sm },
  itemName: { fontSize: 13, color: COLORS.text, fontWeight: '500', lineHeight: 18 },
  itemVariant: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  itemQty: { fontSize: 13, color: COLORS.textSecondary },
  itemPrice: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.xs },
  totalLabel: { fontSize: 14, color: COLORS.textSecondary },
  totalValue: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  grandTotalRow: { marginTop: SIZES.xs },
  grandTotalLabel: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  grandTotalValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  addressText: { fontSize: 14, color: COLORS.text, lineHeight: 22 },
  thankYouContainer: {
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.screenPadding,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
  },
  thankYouText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  shareButton: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  shareButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});
