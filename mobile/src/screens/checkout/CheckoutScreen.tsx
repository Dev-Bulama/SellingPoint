import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, TextInput,
} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { ordersApi } from '../../api/orders';
import { paymentsApi } from '../../api/payments';
import { Address } from '../../types';
import { COLORS, SIZES } from '../../constants';
import { formatCurrency, getErrorMessage } from '../../utils/currency';
import { useCartStore } from '../../store/cartStore';
import apiClient from '../../api/client';

export default function CheckoutScreen({ navigation }: any) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'cash_on_delivery'>('paystack');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [orderNotes, setOrderNotes] = useState('');
  const { cart, fetchCart } = useCartStore();

  useEffect(() => {
    fetchCart();
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const res = await apiClient.get('/addresses');
      const addrs: Address[] = res.data.data;
      setAddresses(addrs);
      const def = addrs.find(a => a.is_default) || addrs[0];
      if (def) setSelectedAddress(def);
    } catch {} finally { setLoadingAddresses(false); }
  };

  const handleValidateCoupon = async () => {
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    try {
      const res = await ordersApi.validateCoupon(couponCode.toUpperCase(), cart?.total ?? 0);
      setDiscount(res.data.discount);
      Alert.alert('Coupon Applied', `You saved ${formatCurrency(res.data.discount)}!`);
    } catch (e) {
      Alert.alert('Invalid Coupon', getErrorMessage(e));
      setDiscount(0);
    } finally { setIsValidatingCoupon(false); }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { Alert.alert('Error', 'Please select a delivery address'); return; }
    if (!cart || cart.items.length === 0) { Alert.alert('Error', 'Your cart is empty'); return; }
    setIsLoading(true);
    try {
      const res = await ordersApi.checkout({
        address_id: selectedAddress.id,
        payment_method: paymentMethod,
        coupon_code: couponCode || undefined,
        notes: orderNotes || undefined,
      });
      const order = res.data.data;

      if (paymentMethod === 'paystack') {
        const payRes = await paymentsApi.initialize(order.order_number);
        Alert.alert(
          'Payment',
          `Reference: ${payRes.data.reference}\n\nIn a real app, the Paystack SDK opens here. For testing, tap Verify to complete payment.`,
          [
            {
              text: 'Verify Payment',
              onPress: async () => {
                const verifyRes = await paymentsApi.verify(payRes.data.reference);
                navigation.replace('OrderSuccess', { orderNumber: order.order_number });
              },
            },
          ]
        );
      } else {
        navigation.replace('OrderSuccess', { orderNumber: order.order_number });
      }
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    } finally { setIsLoading(false); }
  };

  const subtotal = cart?.total ?? 0;
  const total = Math.max(0, subtotal - discount);

  if (loadingAddresses) return <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IonIcon name="arrow-back" size={20} color={COLORS.primary} />
          <Text style={styles.backText}> Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          {addresses.length === 0 ? (
            <TouchableOpacity style={styles.addAddrBtn} onPress={() => navigation.navigate('ProfileTab', { screen: 'Addresses' })}>
              <Text style={styles.addAddrBtnText}>+ Add Delivery Address</Text>
            </TouchableOpacity>
          ) : (
            addresses.map(addr => (
              <TouchableOpacity
                key={addr.id}
                style={[styles.addressCard, selectedAddress?.id === addr.id && styles.selectedCard]}
                onPress={() => setSelectedAddress(addr)}
              >
                <View style={styles.radioOuter}>
                  {selectedAddress?.id === addr.id && <View style={styles.radioInner} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.addrName}>{addr.full_name} · {addr.phone}</Text>
                  <Text style={styles.addrText}>{addr.address_line1}, {addr.city}, {addr.state}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <IonIcon name="card-outline" size={18} color={COLORS.text} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          {(['paystack', 'cash_on_delivery'] as const).map(method => (
            <TouchableOpacity
              key={method}
              style={[styles.paymentCard, paymentMethod === method && styles.selectedCard]}
              onPress={() => setPaymentMethod(method)}
            >
              <View style={styles.radioOuter}>
                {paymentMethod === method && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.paymentLabel}>
                {method === 'paystack' ? 'Pay with Paystack (Card/Transfer/USSD)' : 'Cash on Delivery'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Coupon */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <IonIcon name="pricetag-outline" size={18} color={COLORS.text} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Coupon Code</Text>
          </View>
          <View style={styles.couponRow}>
            <TextInput
              style={styles.couponInput}
              placeholder="Enter coupon code"
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.applyBtn} onPress={handleValidateCoupon} disabled={isValidatingCoupon}>
              {isValidatingCoupon ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.applyBtnText}>Apply</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <IonIcon name="receipt-outline" size={18} color={COLORS.text} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({cart?.items_count ?? 0} items)</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>Calculated at checkout</Text>
            </View>
            {discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: COLORS.success }]}>Discount</Text>
                <Text style={[styles.summaryValue, { color: COLORS.success }]}>-{formatCurrency(discount)}</Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>
        </View>

        {/* Order Notes */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <IonIcon name="create-outline" size={18} color={COLORS.text} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Order Notes</Text>
          </View>
          <TextInput
            style={[styles.couponInput, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Add a note for your order (optional)"
            value={orderNotes}
            onChangeText={setOrderNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.placeOrderText}>Place Order · {formatCurrency(total)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.screenPadding, paddingTop: 48, paddingBottom: 16, backgroundColor: COLORS.white },
  backText: { color: COLORS.primary, fontSize: 15 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text },
  content: { padding: SIZES.screenPadding },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  addAddrBtn: { borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed', borderRadius: SIZES.borderRadius, padding: 16, alignItems: 'center' },
  addAddrBtnText: { color: COLORS.primary, fontWeight: '600' },
  addressCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.white, borderRadius: SIZES.borderRadius, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: COLORS.border },
  selectedCard: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '08' },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  addrName: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  addrText: { fontSize: 13, color: COLORS.textSecondary },
  paymentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: SIZES.borderRadius, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: COLORS.border },
  paymentLabel: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  couponRow: { flexDirection: 'row', gap: 10 },
  couponInput: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.borderRadiusSm, padding: 12, fontSize: 14, backgroundColor: COLORS.white },
  applyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, borderRadius: SIZES.borderRadiusSm, alignItems: 'center', justifyContent: 'center' },
  applyBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
  summaryCard: { backgroundColor: COLORS.white, borderRadius: SIZES.borderRadius, padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  summaryLabel: { fontSize: 14, color: COLORS.textSecondary },
  summaryValue: { fontSize: 14, color: COLORS.text },
  totalRow: { borderBottomWidth: 0, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  footer: { backgroundColor: COLORS.white, padding: SIZES.screenPadding, paddingBottom: 32, borderTopWidth: 1, borderTopColor: COLORS.border },
  placeOrderBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.borderRadius, paddingVertical: 16, alignItems: 'center' },
  placeOrderText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});
