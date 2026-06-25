import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES } from '../../constants';
import { useCartStore } from '../../store/cartStore';

const AUTO_DISMISS_SECONDS = 8;

export default function OrderSuccessScreen({ route, navigation }: any) {
  const { orderNumber } = route.params;
  const { clearCart } = useCartStore();
  const [countdown, setCountdown] = useState(AUTO_DISMISS_SECONDS);
  const progressAnim = useRef(new Animated.Value(1)).current;

  const resetToHome = () => {
    // Replace OrderSuccess with Cart in the CartStack (clears it from history)
    navigation.replace('Cart');
    // Then switch to HomeTab
    navigation.getParent()?.navigate('HomeTab');
  };

  useEffect(() => {
    clearCart();

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: AUTO_DISMISS_SECONDS * 1000,
      useNativeDriver: false,
    }).start();

    const tick = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(tick); return 0; }
        return prev - 1;
      });
    }, 1000);

    const dismiss = setTimeout(resetToHome, AUTO_DISMISS_SECONDS * 1000);

    return () => { clearInterval(tick); clearTimeout(dismiss); };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>

        <TouchableOpacity style={styles.closeBtn} onPress={resetToHome} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <IonIcon name="close" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <IonIcon name="checkmark-circle" size={80} color="green" style={styles.checkmark} />
        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.subtitle}>Your order has been placed successfully.</Text>

        <View style={styles.orderBox}>
          <Text style={styles.orderLabel}>Order Number</Text>
          <Text style={styles.orderNumber}>{orderNumber}</Text>
        </View>

        <Text style={styles.note}>
          You will receive a confirmation notification once your order is processed.
        </Text>

        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => navigation.navigate('OrdersTab')}
        >
          <Text style={styles.trackBtnText}>Track Order</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeBtn} onPress={resetToHome}>
          <Text style={styles.homeBtnText}>Continue Shopping</Text>
        </TouchableOpacity>

        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressBar, {
              width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            }]}
          />
        </View>
        <Text style={styles.dismissNote}>Closing automatically in {countdown}s</Text>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: SIZES.screenPadding },
  card: { backgroundColor: COLORS.white, borderRadius: SIZES.borderRadiusLg, padding: 32, alignItems: 'center', width: '100%', elevation: 4 },
  closeBtn: { position: 'absolute', top: 16, right: 16, padding: 4 },
  checkmark: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 },
  orderBox: { backgroundColor: COLORS.grayLight, borderRadius: SIZES.borderRadius, padding: 16, width: '100%', alignItems: 'center', marginBottom: 20 },
  orderLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  orderNumber: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  note: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 20 },
  trackBtn: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: SIZES.borderRadius, width: '100%', alignItems: 'center', marginBottom: 12 },
  trackBtnText: { color: COLORS.white, fontSize: 15, fontWeight: 'bold' },
  homeBtn: { paddingVertical: 14, borderRadius: SIZES.borderRadius, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 },
  homeBtnText: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  progressTrack: { width: '100%', height: 3, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
  progressBar: { height: 3, backgroundColor: COLORS.primary, borderRadius: 2 },
  dismissNote: { fontSize: 11, color: COLORS.textSecondary, marginTop: 8 },
});
