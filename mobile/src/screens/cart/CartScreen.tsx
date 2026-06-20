import React, { useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { COLORS, SIZES } from '../../constants';
import { useCartStore } from '../../store/cartStore';
import { CartItem } from '../../types';
import { formatCurrency } from '../../utils/currency';

function CartItemRow({ item, onUpdateQty, onRemove }: {
  item: CartItem;
  onUpdateQty: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <View style={styles.cartItem}>
      <View style={styles.itemImage}>
        <Text style={{ fontSize: 32 }}>🛍️</Text>
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
        {item.variant && <Text style={styles.variantText}>{item.variant.name}: {item.variant.value}</Text>}
        <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => item.quantity > 1 ? onUpdateQty(item.id, item.quantity - 1) : onRemove(item.id)}
          >
            <Text style={styles.qtyBtnText}>{item.quantity === 1 ? '🗑️' : '−'}</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{item.quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => onUpdateQty(item.id, item.quantity + 1)}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
          <Text style={styles.subtotal}>{formatCurrency(item.subtotal)}</Text>
        </View>
      </View>
    </View>
  );
}

export default function CartScreen({ navigation }: any) {
  const { cart, isLoading, fetchCart, updateItem, removeItem, clearCart } = useCartStore();

  useEffect(() => { fetchCart(); }, []);

  const handleClear = () => {
    Alert.alert('Clear Cart', 'Remove all items from cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);
  };

  if (isLoading && !cart) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        {!isEmpty && (
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearBtn}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {isEmpty ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Add items to get started</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate('HomeTab')}
          >
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart.items}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <CartItemRow
                item={item}
                onUpdateQty={updateItem}
                onRemove={removeItem}
              />
            )}
            contentContainerStyle={{ padding: SIZES.screenPadding }}
          />
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total ({cart.items_count} items)</Text>
              <Text style={styles.totalAmount}>{formatCurrency(cart.total)}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => navigation.navigate('Checkout')}
            >
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding, paddingTop: 48, paddingBottom: 16,
    backgroundColor: COLORS.white,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  clearBtn: { color: COLORS.danger, fontSize: 14 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 80, marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  emptySubtext: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 32 },
  shopBtn: {
    backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 32,
    borderRadius: SIZES.borderRadius,
  },
  shopBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  cartItem: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius, marginBottom: 12, padding: 12,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05,
  },
  itemImage: {
    width: 80, height: 80, borderRadius: SIZES.borderRadiusSm,
    backgroundColor: COLORS.grayLight, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 14, color: COLORS.text, fontWeight: '500', marginBottom: 4 },
  variantText: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  itemPrice: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.grayLight,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  qtyBtnText: { fontSize: 14 },
  qtyValue: { fontSize: 15, fontWeight: 'bold', color: COLORS.text, marginHorizontal: 12, minWidth: 20, textAlign: 'center' },
  subtotal: { fontSize: 14, fontWeight: 'bold', color: COLORS.text, marginLeft: 'auto' },
  footer: {
    backgroundColor: COLORS.white, padding: SIZES.screenPadding, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  totalLabel: { fontSize: 15, color: COLORS.textSecondary },
  totalAmount: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  checkoutBtn: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.borderRadius,
    paddingVertical: 16, alignItems: 'center',
  },
  checkoutBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});
