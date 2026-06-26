import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { usePaystack } from 'react-native-paystack-webview';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { ordersApi } from '../../api/orders';
import { paymentsApi } from '../../api/payments';
// Note: payment flow uses popup.checkout() directly — no backend pre-initialization
import { Address } from '../../types';
import { COLORS, SIZES } from '../../constants';
import { formatCurrency, getErrorMessage } from '../../utils/currency';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/client';
import AppAlert from '../../components/AppAlert';

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
  const [orderPlaced, setOrderPlaced] = useState(false);
  const paystackRefRef = useRef('');
  const pendingOrderRef = useRef('');

  const { popup } = usePaystack();

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertProps, setAlertProps] = useState<{
    icon: string; iconColor: string; title: string; message: string;
    buttons?: { text: string; onPress?: () => void; style?: 'primary' | 'outline' }[];
  }>({ icon: '', iconColor: '', title: '', message: '' });

  const { cart, fetchCart } = useCartStore();
  const { user } = useAuthStore();

  // Computed here so handlePlaceOrder can reference them
  const subtotal = cart?.total ?? 0;
  const total = Math.max(0, subtotal - discount);

  const showAlert = (
    icon: string, iconColor: string, title: string, message: string,
    buttons?: { text: string; onPress?: () => void; style?: 'primary' | 'outline' }[],
  ) => {
    setAlertProps({ icon, iconColor, title, message, buttons });
    setAlertVisible(true);
  };

  const loadAddresses = useCallback(async () => {
    try {
      const res = await apiClient.get('/addresses');
      const addrs: Address[] = res.data.data;
      setAddresses(addrs);
      setSelectedAddress(prev => {
        if (prev) {
          const stillExists = addrs.find(a => a.id === prev.id);
          if (stillExists) return stillExists;
        }
        return addrs.find(a => a.is_default) || addrs[0] || null;
      });
    } catch {} finally { setLoadingAddresses(false); }
  }, []);

  useEffect(() => {
    fetchCart();
  }, []);

  // Reload addresses every time the screen comes into focus (e.g. after adding new address)
  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [loadAddresses]),
  );

  const handleValidateCoupon = async () => {
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    try {
      const res = await ordersApi.validateCoupon(couponCode.toUpperCase(), cart?.total ?? 0);
      setDiscount(res.data.discount);
      showAlert('pricetag', COLORS.success, 'Coupon Applied', `You saved ${formatCurrency(res.data.discount)}!`);
    } catch (e) {
      showAlert('close-circle', COLORS.danger, 'Invalid Coupon', getErrorMessage(e));
      setDiscount(0);
    } finally { setIsValidatingCoupon(false); }
  };

  const handlePlaceOrder = async () => {
    if (orderPlaced) return; // prevent double-tap
    if (!selectedAddress) {
      showAlert('location-outline', COLORS.primary, 'No Address', 'Please select a delivery address.');
      return;
    }
    if (!cart || cart.items.length === 0) {
      // Cart is empty — if an order was recently placed navigate to it
      if (pendingOrderRef.current) {
        navigation.replace('OrderSuccess', { orderNumber: pendingOrderRef.current });
      } else {
        showAlert('cart-outline', COLORS.danger, 'Empty Cart', 'Your cart is empty.');
      }
      return;
    }
    setIsLoading(true);
    try {
      const res = await ordersApi.checkout({
        address_id: selectedAddress.id,
        payment_method: paymentMethod,
        coupon_code: couponCode || undefined,
        notes: orderNotes || undefined,
      });
      const order = res.data.data;
      pendingOrderRef.current = order.order_number;
      setOrderPlaced(true);

      if (paymentMethod === 'paystack') {
        const orderTotal = order.total as number;
        const reference = `SP_${order.order_number}_${Date.now()}`;
        paystackRefRef.current = reference;
        setIsLoading(false);

        popup.checkout({
          email: user?.email ?? '',
          amount: orderTotal,
          reference,
          metadata: { order_number: order.order_number, user_id: user?.id },
          onSuccess: async () => {
            setIsLoading(true);
            try {
              await paymentsApi.verify(paystackRefRef.current, pendingOrderRef.current);
              navigation.replace('OrderSuccess', { orderNumber: pendingOrderRef.current });
            } catch {
              showAlert('warning-outline', COLORS.danger, 'Verification Error',
                'Payment was received but could not be confirmed automatically. Please contact support with reference: ' + paystackRefRef.current);
            } finally { setIsLoading(false); }
          },
          onCancel: () => {
            showAlert('information-circle', COLORS.primary, 'Payment Cancelled',
              'Your order was placed but payment was not completed. You can complete payment from your Orders page.',
              [
                { text: 'View My Orders', onPress: () => { setAlertVisible(false); navigation.replace('OrderSuccess', { orderNumber: pendingOrderRef.current }); }, style: 'primary' },
                { text: 'Dismiss', onPress: () => setAlertVisible(false) },
              ]);
          },
        });
        return;
      } else {
        navigation.replace('OrderSuccess', { orderNumber: order.order_number });
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? getErrorMessage(e);
      // Cart was already cleared — a prior order was placed
      if (msg?.toLowerCase().includes('cart is empty') && pendingOrderRef.current) {
        navigation.replace('OrderSuccess', { orderNumber: pendingOrderRef.current });
        return;
      }
      setOrderPlaced(false); // allow retry on genuine errors
      showAlert('close-circle', COLORS.danger, 'Order Failed', msg);
    } finally { setIsLoading(false); }
  };

  if (loadingAddresses) return <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
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
            <TouchableOpacity style={styles.addAddrBtn} onPress={() => navigation.navigate('AddAddress')}>
              <Text style={styles.addAddrBtnText}>+ Add Delivery Address</Text>
            </TouchableOpacity>
          ) : (
            <>
              {addresses.map(addr => (
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
              ))}
              <TouchableOpacity style={styles.addMoreBtn} onPress={() => navigation.navigate('AddAddress')}>
                <IonIcon name="add-circle-outline" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                <Text style={styles.addMoreText}>Add New Address</Text>
              </TouchableOpacity>
            </>
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
                {method === 'paystack' ? '💳  Pay with Paystack (Card / Transfer / USSD)' : '💵  Cash on Delivery'}
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
            placeholderTextColor="#BDBDBD"
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
            placeholderTextColor="#BDBDBD"
            value={orderNotes}
            onChangeText={setOrderNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.placeOrderBtn, orderPlaced && { opacity: 0.6 }]} onPress={handlePlaceOrder} disabled={isLoading || orderPlaced}>
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
  addMoreBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4, marginTop: 4 },
  addMoreText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  addressCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.white, borderRadius: SIZES.borderRadius, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: COLORS.border },
  selectedCard: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '08' },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  addrName: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  addrText: { fontSize: 13, color: COLORS.textSecondary },
  paymentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: SIZES.borderRadius, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: COLORS.border },
  paymentLabel: { fontSize: 14, color: COLORS.text, fontWeight: '500', flex: 1, flexWrap: 'wrap' },
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
