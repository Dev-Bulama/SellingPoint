import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, Image, Animated, Pressable,
  Dimensions,
} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES } from '../../constants';
import { useCartStore } from '../../store/cartStore';
import { CartItem } from '../../types';
import { formatCurrency } from '../../utils/currency';
import AppAlert from '../../components/AppAlert';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

// ---------------------------------------------------------------------------
// CartItemRow
// ---------------------------------------------------------------------------
function CartItemRow({
  item,
  onUpdateQty,
  onRemove,
  onConfirmRemove,
}: {
  item: CartItem;
  onUpdateQty: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  onConfirmRemove: (id: number, name: string, onCancel: () => void) => void;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [swiped, setSwiped] = useState(false);

  const handleLongPress = () => {
    if (swiped) {
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      setSwiped(false);
    } else {
      Animated.spring(translateX, { toValue: -SWIPE_THRESHOLD, useNativeDriver: true }).start();
      setSwiped(true);
    }
  };

  const triggerRemove = () => {
    onConfirmRemove(item.id, item.product.name, () => {
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      setSwiped(false);
    });
  };

  return (
    <View style={styles.swipeWrapper}>
      {/* Delete reveal layer */}
      <View style={styles.deleteReveal}>
        <TouchableOpacity style={styles.deleteBtn} onPress={triggerRemove}>
          <IonIcon name="trash-outline" size={20} color={COLORS.white} />
          <Text style={styles.deleteBtnLabel}>Remove</Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable card */}
      <Animated.View style={[styles.cartItem, { transform: [{ translateX }] }]}>
        <Pressable onLongPress={handleLongPress} style={styles.cartItemInner}>
          {/* Product image */}
          <View style={styles.itemImage}>
            {item.product.thumbnail_url ? (
              <Image
                source={{ uri: item.product.thumbnail_url }}
                style={styles.itemImageImg}
                resizeMode="cover"
              />
            ) : (
              <IonIcon name="bag-handle-outline" size={32} color={COLORS.border} />
            )}
          </View>

          <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
            {item.variant && (
              <Text style={styles.variantText}>{item.variant.name}: {item.variant.value}</Text>
            )}
            <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>

            {/* Premium quantity stepper */}
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={[styles.qtyCircleBtn, item.quantity === 1 && styles.qtyCircleBtnDanger]}
                onPress={() =>
                  item.quantity > 1
                    ? onUpdateQty(item.id, item.quantity - 1)
                    : triggerRemove()
                }
              >
                {item.quantity === 1
                  ? <IonIcon name="close" size={16} color={COLORS.danger} />
                  : <IonIcon name="remove" size={16} color={COLORS.text} />
                }
              </TouchableOpacity>

              <Text style={styles.qtyValue}>{item.quantity}</Text>

              <TouchableOpacity
                style={styles.qtyCircleBtn}
                onPress={() => onUpdateQty(item.id, item.quantity + 1)}
              >
                <IonIcon name="add" size={16} color={COLORS.text} />
              </TouchableOpacity>

              <Text style={styles.subtotal}>{formatCurrency(item.subtotal)}</Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// EmptyCart
// ---------------------------------------------------------------------------
function EmptyCart({ onShopNow }: { onShopNow: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIllustration}>
        <View style={styles.emptyCircle}>
          <IonIcon name="cart-outline" size={64} color={COLORS.border} />
        </View>
        <View style={[styles.floatDot, { top: 10, right: 20, width: 10, height: 10, backgroundColor: COLORS.primaryLight }]} />
        <View style={[styles.floatDot, { bottom: 20, left: 10, width: 14, height: 14, backgroundColor: COLORS.accent }]} />
        <View style={[styles.floatDot, { top: 30, left: 5, width: 8, height: 8, backgroundColor: COLORS.warning }]} />
      </View>

      <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
      <Text style={styles.emptySubtext}>
        Looks like you haven't added anything yet.{'\n'}
        Start shopping and find great deals!
      </Text>

      <TouchableOpacity style={styles.shopNowBtn} onPress={onShopNow} activeOpacity={0.85}>
        <Text style={styles.shopNowBtnText}>Shop Now</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------------------------------------------------------------------------
// CartScreen
// ---------------------------------------------------------------------------
export default function CartScreen({ navigation }: any) {
  const { cart, isLoading, fetchCart, updateItem, removeItem, clearCart } = useCartStore();

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

  useEffect(() => { fetchCart(); }, []);

  const handleClear = () => {
    showAlert('trash-outline', COLORS.danger, 'Clear Cart', 'Remove all items from your cart?', [
      { text: 'Cancel', style: 'outline', onPress: () => setAlertVisible(false) },
      { text: 'Clear All', style: 'primary', onPress: () => { setAlertVisible(false); clearCart(); } },
    ]);
  };

  const handleConfirmRemove = (id: number, name: string, onCancel: () => void) => {
    showAlert('trash-outline', COLORS.danger, 'Remove Item', `Remove "${name}" from cart?`, [
      { text: 'Cancel', style: 'outline', onPress: () => { setAlertVisible(false); onCancel(); } },
      { text: 'Remove', style: 'primary', onPress: () => { setAlertVisible(false); removeItem(id); } },
    ]);
  };

  if (isLoading && !cart) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

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

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        {!isEmpty && (
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearBtn}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {isEmpty ? (
        <EmptyCart onShopNow={() => navigation.navigate('HomeTab')} />
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
                onConfirmRemove={handleConfirmRemove}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <Text style={styles.swipeHint}>Long-press an item to reveal delete</Text>
            }
          />

          {/* ── Order Summary ── */}
          <View style={styles.footer}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items ({cart.items_count})</Text>
                <Text style={styles.summaryValue}>{formatCurrency(cart.total)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                <Text style={[styles.summaryValue, { color: COLORS.success }]}>Free</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>{formatCurrency(cart.total)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => navigation.navigate('Checkout')}
              activeOpacity={0.88}
            >
              <Text style={styles.checkoutBtnText}>
                Proceed to Checkout · {formatCurrency(cart.total)}
              </Text>
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
    paddingHorizontal: SIZES.screenPadding, paddingTop: 52, paddingBottom: 16,
    backgroundColor: COLORS.white,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  clearBtn: { color: COLORS.danger, fontSize: 14, fontWeight: '500' },

  listContent: { padding: SIZES.screenPadding, paddingBottom: 8 },
  swipeHint: { textAlign: 'center', fontSize: 11, color: COLORS.textMuted, marginTop: 4, marginBottom: 12 },

  swipeWrapper: { marginBottom: 12, borderRadius: SIZES.borderRadius, overflow: 'hidden' },
  deleteReveal: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    width: SWIPE_THRESHOLD, backgroundColor: COLORS.danger,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: SIZES.borderRadius,
  },
  deleteBtn: { alignItems: 'center' },
  deleteBtnLabel: { color: COLORS.white, fontSize: 11, fontWeight: '600', marginTop: 2 },

  cartItem: {
    backgroundColor: COLORS.white, borderRadius: SIZES.borderRadius,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1,
  },
  cartItemInner: { flexDirection: 'row', padding: 12 },

  itemImage: {
    width: 90, height: 90, borderRadius: SIZES.borderRadiusSm,
    backgroundColor: COLORS.grayLight, alignItems: 'center', justifyContent: 'center',
    marginRight: 12, overflow: 'hidden',
  },
  itemImageImg: { width: 90, height: 90 },

  itemDetails: { flex: 1 },
  itemName: { fontSize: 14, color: COLORS.text, fontWeight: '600', marginBottom: 3, lineHeight: 20 },
  variantText: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginBottom: 10 },

  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyCircleBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: COLORS.grayLight, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  qtyCircleBtnDanger: { borderColor: COLORS.danger, backgroundColor: '#FFF0F0' },
  qtyValue: {
    fontSize: 16, fontWeight: 'bold', color: COLORS.text,
    marginHorizontal: 14, minWidth: 20, textAlign: 'center',
  },
  subtotal: { fontSize: 14, fontWeight: 'bold', color: COLORS.text, marginLeft: 'auto' },

  footer: {
    backgroundColor: COLORS.white, paddingHorizontal: SIZES.screenPadding,
    paddingTop: 12, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06,
  },
  summaryCard: {
    backgroundColor: COLORS.grayLight, borderRadius: SIZES.borderRadius,
    padding: 14, marginBottom: 14,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: COLORS.textSecondary },
  summaryValue: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  totalRow: {
    borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingTop: 10, marginTop: 4, marginBottom: 0,
  },
  totalLabel: { fontSize: 15, fontWeight: 'bold', color: COLORS.text },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  checkoutBtn: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.borderRadius,
    paddingVertical: 16, alignItems: 'center',
    elevation: 2, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3,
  },
  checkoutBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIllustration: {
    width: 160, height: 160, marginBottom: 28, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  emptyCircle: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: '#FFF3E0',
    alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15,
  },
  floatDot: { position: 'absolute', borderRadius: 99 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
  emptySubtext: {
    fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32,
  },
  shopNowBtn: {
    backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 48,
    borderRadius: SIZES.borderRadius,
    elevation: 3, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3,
  },
  shopNowBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});
