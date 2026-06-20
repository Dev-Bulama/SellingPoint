import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Dimensions, Alert,
} from 'react-native';
import { COLORS, SIZES } from '../../constants';
import { productsApi } from '../../api/products';
import { wishlistApi } from '../../api/wishlist';
import { Product, ProductVariant } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }: any) {
  const { slug } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadProduct();
    if (isAuthenticated) checkWishlist();
  }, [slug]);

  const loadProduct = async () => {
    try {
      const res = await productsApi.show(slug);
      setProduct(res.data.data);
    } catch {
      Alert.alert('Error', 'Product not found');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    if (!product) return;
    try {
      const res = await wishlistApi.check(product.id);
      setInWishlist(res.data.in_wishlist);
    } catch {}
  };

  const handleAddToCart = async () => {
    if (!product || !isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }
    setAddingToCart(true);
    try {
      await addItem(product.id, quantity, selectedVariant?.id);
      Alert.alert('Added to Cart', `${product.name} added successfully!`);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigation.navigate('CartTab');
  };

  const handleWishlistToggle = async () => {
    if (!product || !isAuthenticated) { navigation.navigate('Auth'); return; }
    try {
      const res = await wishlistApi.toggle(product.id);
      setInWishlist(res.data.in_wishlist);
    } catch {}
  };

  const effectivePrice = product
    ? (product.discount_price ?? product.price) + (selectedVariant?.price_modifier ?? 0)
    : 0;

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!product) return null;

  return (
    <View style={styles.container}>
      {/* Back + Wishlist header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleWishlistToggle} style={styles.headerBtn}>
          <Text style={{ fontSize: 22 }}>{inWishlist ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageEmoji}>🛍️</Text>
          </View>
          {product.discount_percentage > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount_percentage}% OFF</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Brand */}
          {product.brand && <Text style={styles.brand}>{product.brand.name}</Text>}

          {/* Name */}
          <Text style={styles.name}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Text style={styles.ratingStars}>
              {'⭐'.repeat(Math.round(product.average_rating))}
            </Text>
            <Text style={styles.ratingValue}> {product.average_rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}> ({product.review_count} reviews)</Text>
            <Text style={styles.soldCount}> · {product.sold_count} sold</Text>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(effectivePrice)}</Text>
            {product.discount_price && (
              <Text style={styles.originalPrice}>{formatCurrency(product.price)}</Text>
            )}
          </View>

          {/* Stock */}
          <View style={[styles.stockBadge, { backgroundColor: product.in_stock ? '#E8F8EF' : '#FEE' }]}>
            <Text style={{ color: product.in_stock ? COLORS.success : COLORS.danger, fontSize: 13, fontWeight: '600' }}>
              {product.in_stock ? `✓ In Stock (${product.stock_quantity} available)` : '✗ Out of Stock'}
            </Text>
          </View>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Variant</Text>
              <View style={styles.variantList}>
                {product.variants.map((v) => (
                  <TouchableOpacity
                    key={v.id}
                    style={[styles.variantChip, selectedVariant?.id === v.id && styles.activeVariantChip]}
                    onPress={() => setSelectedVariant(v.id === selectedVariant?.id ? null : v)}
                  >
                    <Text style={[styles.variantText, selectedVariant?.id === v.id && { color: COLORS.white }]}>
                      {v.name}: {v.value}
                      {v.price_modifier > 0 ? ` (+${formatCurrency(v.price_modifier)})` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Quantity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          {product.short_description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.short_description}</Text>
            </View>
          )}

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specifications</Text>
              {Object.entries(product.specifications).map(([key, value]) => (
                <View key={key} style={styles.specRow}>
                  <Text style={styles.specKey}>{key}</Text>
                  <Text style={styles.specValue}>{value}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.cartBtn, !product.in_stock && styles.disabledBtn]}
          onPress={handleAddToCart}
          disabled={addingToCart || !product.in_stock}
        >
          {addingToCart ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
          ) : (
            <Text style={styles.cartBtnText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buyBtn, !product.in_stock && styles.disabledBtn]}
          onPress={handleBuyNow}
          disabled={!product.in_stock}
        >
          <Text style={styles.buyBtnText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding, paddingTop: 48, paddingBottom: 8,
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1,
  },
  headerBtnText: { fontSize: 20, color: COLORS.text },
  imageContainer: {
    width: width, height: 300, backgroundColor: COLORS.grayLight,
    alignItems: 'center', justifyContent: 'center', marginTop: 80,
  },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  imageEmoji: { fontSize: 100 },
  discountBadge: {
    position: 'absolute', top: 16, right: 16,
    backgroundColor: COLORS.accent, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  discountText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  content: { padding: SIZES.screenPadding },
  brand: { fontSize: 12, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  name: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, lineHeight: 28, marginBottom: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  ratingStars: { fontSize: 13 },
  ratingValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  reviewCount: { fontSize: 13, color: COLORS.textSecondary },
  soldCount: { fontSize: 13, color: COLORS.textMuted },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  price: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary, marginRight: 12 },
  originalPrice: { fontSize: 16, color: COLORS.textMuted, textDecorationLine: 'line-through' },
  stockBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
  variantList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  variantChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.grayLight,
  },
  activeVariantChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  variantText: { fontSize: 13, color: COLORS.text },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: COLORS.grayLight, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  qtyBtnText: { fontSize: 20, color: COLORS.text, fontWeight: 'bold' },
  qtyValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, minWidth: 32, textAlign: 'center' },
  description: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  specRow: {
    flexDirection: 'row', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  specKey: { flex: 1, fontSize: 14, color: COLORS.textSecondary },
  specValue: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '500' },
  bottomActions: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', padding: 16, backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.border, gap: 12,
    paddingBottom: 32,
  },
  cartBtn: {
    flex: 1, paddingVertical: 14, borderRadius: SIZES.borderRadius,
    borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center',
  },
  cartBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: 'bold' },
  buyBtn: {
    flex: 1, paddingVertical: 14, borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.primary, alignItems: 'center',
  },
  buyBtnText: { color: COLORS.white, fontSize: 15, fontWeight: 'bold' },
  disabledBtn: { opacity: 0.5 },
});
