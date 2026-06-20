import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../../constants';

export default function OrderSuccessScreen({ route, navigation }: any) {
  const { orderNumber } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.checkmark}>✅</Text>
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
          onPress={() => navigation.navigate('OrderDetail', { orderNumber })}
        >
          <Text style={styles.trackBtnText}>Track Order</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('HomeTab')}
        >
          <Text style={styles.homeBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: SIZES.screenPadding },
  card: { backgroundColor: COLORS.white, borderRadius: SIZES.borderRadiusLg, padding: 32, alignItems: 'center', width: '100%', elevation: 4 },
  checkmark: { fontSize: 80, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 },
  orderBox: { backgroundColor: COLORS.grayLight, borderRadius: SIZES.borderRadius, padding: 16, width: '100%', alignItems: 'center', marginBottom: 20 },
  orderLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  orderNumber: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  note: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 20 },
  trackBtn: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: SIZES.borderRadius, width: '100%', alignItems: 'center', marginBottom: 12 },
  trackBtnText: { color: COLORS.white, fontSize: 15, fontWeight: 'bold' },
  homeBtn: { paddingVertical: 14, borderRadius: SIZES.borderRadius, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  homeBtnText: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
});
