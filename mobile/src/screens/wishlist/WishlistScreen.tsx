import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES } from '../../constants';
import { wishlistApi } from '../../api/wishlist';
import { useCartStore } from '../../store/cartStore';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/currency';
import AppAlert from '../../components/AppAlert';

export default function WishlistScreen({ navigation }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertProps, setAlertProps] = useState({ icon: '', iconColor: '', title: '', message: '', autoDismissMs: undefined as number | undefined });
  const { addItem } = useCartStore();

  const loadWishlist = async () => {
    try {
      const res = await wishlistApi.list();
      setProducts(res.data.data);
    } catch {} finally {
      setLoading(false); setRefreshing(false);
    }
  };

  useEffect(() => { loadWishlist(); }, []);

  const handleRemove = async (productId: number) => {
    await wishlistApi.toggle(productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleAddToCart = async (product: Product) => {
    setAlertProps({ icon: 'checkmark-circle', iconColor: COLORS.success, title: 'Added to Cart', message: `${product.name} added successfully!`, autoDismissMs: 2500 });
    setAlertVisible(true);
    try {
      await addItem(product.id, 1);
      await handleRemove(product.id);
    } catch {
      setAlertProps({ icon: 'close-circle', iconColor: COLORS.danger, title: 'Error', message: 'Could not add to cart.', autoDismissMs: undefined });
      setAlertVisible(true);
    }
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      <AppAlert
        visible={alertVisible}
        icon={alertProps.icon}
        iconColor={alertProps.iconColor}
        title={alertProps.title}
        message={alertProps.message}
        autoDismissMs={alertProps.autoDismissMs}
        onDismiss={() => setAlertVisible(false)}
      />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <Text style={styles.count}>{products.length} items</Text>
      </View>
      {products.length === 0 ? (
        <View style={styles.empty}>
          <IonIcon name="heart-outline" size={64} color={COLORS.border} style={{ marginBottom: 20 }} />
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySub}>Save items you love for later</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('HomeTab')}>
            <Text style={styles.shopBtnText}>Explore Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: SIZES.screenPadding }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadWishlist(); }} colors={[COLORS.primary]} />}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <TouchableOpacity
                style={styles.itemContent}
                onPress={() => navigation.navigate('HomeTab', { screen: 'ProductDetail', params: { slug: item.slug } })}
              >
                <View style={styles.itemImage}>
                  {item.thumbnail_url
                    ? <Image source={{ uri: item.thumbnail_url }} style={styles.itemImageImg} resizeMode="cover" />
                    : <IonIcon name="bag-handle-outline" size={36} color={COLORS.border} />}
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{formatCurrency(item.effective_price)}</Text>
                  {item.discount_price && (
                    <Text style={styles.originalPrice}>{formatCurrency(item.price)}</Text>
                  )}
                  <Text style={[styles.stockText, { color: item.in_stock ? COLORS.success : COLORS.danger }]}>
                    {item.in_stock ? 'In Stock' : 'Out of Stock'}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.addCartBtn} onPress={() => handleAddToCart(item)} disabled={!item.in_stock}>
                  <Text style={styles.addCartText}>Add to Cart</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.removeBtn}>
                  <IonIcon name="trash-outline" size={18} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
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
  count: { fontSize: 14, color: COLORS.textSecondary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 80, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 32 },
  shopBtn: { backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: SIZES.borderRadius },
  shopBtnText: { color: COLORS.white, fontSize: 15, fontWeight: 'bold' },
  item: { backgroundColor: COLORS.white, borderRadius: SIZES.borderRadius, marginBottom: 12, overflow: 'hidden', elevation: 1 },
  itemContent: { flexDirection: 'row', padding: 12 },
  itemImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: COLORS.grayLight, alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden' },
  itemImageImg: { width: 80, height: 80, borderRadius: 8 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '500', color: COLORS.text, marginBottom: 4 },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginBottom: 2 },
  originalPrice: { fontSize: 12, color: COLORS.textMuted, textDecorationLine: 'line-through', marginBottom: 4 },
  stockText: { fontSize: 12, fontWeight: '600' },
  itemActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.divider },
  addCartBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: COLORS.primary },
  addCartText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  removeBtn: { paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  removeText: { fontSize: 18 },
});
