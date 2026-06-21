import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Dimensions, Alert, Image, Share,
  FlatList, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../../constants';
import { productsApi } from '../../api/products';
import { wishlistApi } from '../../api/wishlist';
import { Product, ProductVariant, Review, ProductImage } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import IonIcon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 320;
const RECENTLY_VIEWED_KEY = 'recently_viewed';
const MAX_RECENT = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function addToRecentlyViewed(product: Product) {
  try {
    const raw = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
    const existing: Product[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((p) => p.id !== product.id);
    const next = [product, ...filtered].slice(0, MAX_RECENT);
    await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  } catch {}
}

// ---------------------------------------------------------------------------
// StarRow
// ---------------------------------------------------------------------------
function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const diff = rating - (i - 1);
        const iconName = diff >= 1 ? 'star' : diff >= 0.5 ? 'star-half' : 'star-outline';
        return (
          <IonIcon
            key={i}
            name={iconName}
            size={size}
            color={diff > 0 ? '#F39C12' : COLORS.grayMedium}
          />
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// ReviewCard
// ---------------------------------------------------------------------------
function ReviewCard({ review }: { review: Review }) {
  return (
    <View style={reviewStyles.card}>
      <View style={reviewStyles.header}>
        <View style={reviewStyles.avatar}>
          <Text style={reviewStyles.avatarText}>{review.user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={reviewStyles.userName}>{review.user.name}</Text>
          <StarRow rating={review.rating} size={12} />
        </View>
        <Text style={reviewStyles.date}>{new Date(review.created_at).toLocaleDateString()}</Text>
      </View>
      {review.title ? <Text style={reviewStyles.title}>{review.title}</Text> : null}
      {review.body ? <Text style={reviewStyles.body}>{review.body}</Text> : null}
      {review.is_verified_purchase && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
          <IonIcon name="checkmark-circle" size={14} color={COLORS.success} style={{ marginRight: 4 }} />
          <Text style={reviewStyles.verified}>Verified Purchase</Text>
        </View>
      )}
    </View>
  );
}

const reviewStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 12,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  avatarText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
  userName: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  date: { fontSize: 11, color: COLORS.textMuted },
  title: { fontSize: 14, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  body: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  verified: { fontSize: 11, color: COLORS.success, marginTop: 6, fontWeight: '600' },
});

// ---------------------------------------------------------------------------
// ProductDetailScreen
// ---------------------------------------------------------------------------
export default function ProductDetailScreen({ route, navigation }: any) {
  const { slug } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [related, setRelated] = useState<Product[]>([]);
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const loadProduct = useCallback(async () => {
    try {
      const res = await productsApi.show(slug);
      const p = res.data.data;
      setProduct(p);
      addToRecentlyViewed(p);
    } catch {
      Alert.alert('Error', 'Product not found');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const loadReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const res = await productsApi.reviews(slug);
      setReviews(res.data.data);
    } catch {} finally {
      setReviewsLoading(false);
    }
  }, [slug]);

  const loadRelated = useCallback(async () => {
    try {
      const res = await productsApi.related(slug);
      setRelated(res.data.data);
    } catch {}
  }, [slug]);

  const checkWishlist = useCallback(async () => {
    if (!product) return;
    try {
      const res = await wishlistApi.check(product.id);
      setInWishlist(res.data.in_wishlist);
    } catch {}
  }, [product]);

  useEffect(() => {
    loadProduct();
    loadReviews();
    loadRelated();
  }, [slug]);

  useEffect(() => {
    if (product && isAuthenticated) checkWishlist();
  }, [product, isAuthenticated]);

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

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        title: product.name,
        message: `Check out ${product.name} — ${formatCurrency(product.effective_price)}\n\nFind it on SellingPoint!`,
      });
    } catch {}
  };

  const onImageScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveImageIndex(idx);
  };

  const effectivePrice = product
    ? (product.discount_price ?? product.price) + (selectedVariant?.price_modifier ?? 0)
    : 0;

  // Gather all images (primary + gallery)
  const allImages: string[] = [];
  if (product) {
    if (product.thumbnail_url) allImages.push(product.thumbnail_url);
    if (product.images) {
      product.images.forEach((img) => {
        if (!allImages.includes(img.image_url)) allImages.push(img.image_url);
      });
    }
  }

  const stockQty = product?.stock_quantity ?? 0;
  const stockColor =
    !product?.in_stock ? COLORS.danger
    : stockQty <= 10 ? '#FF8C00'
    : COLORS.success;
  const stockLabel =
    !product?.in_stock ? 'Out of Stock'
    : stockQty <= 10 ? `In Stock (${stockQty} left)`
    : `In Stock (${stockQty} available)`;

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  if (!product) return null;

  return (
    <View style={styles.container}>
      {/* ── Floating header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <IonIcon name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
            <IonIcon name="share-outline" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleWishlistToggle} style={styles.headerBtn}>
            <IonIcon name={inWishlist ? 'heart' : 'heart-outline'} size={22} color={inWishlist ? COLORS.danger : COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Image Gallery ── */}
        <View style={styles.galleryContainer}>
          {allImages.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onImageScroll}
              scrollEventThrottle={16}
            >
              {allImages.map((uri, idx) => (
                <Image
                  key={idx}
                  source={{ uri }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.imagePlaceholder}>
              <IonIcon name="bag-handle-outline" size={100} color={COLORS.border} />
            </View>
          )}

          {/* Discount badge */}
          {product.discount_percentage > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount_percentage}% OFF</Text>
            </View>
          )}

          {/* Dot indicators */}
          {allImages.length > 1 && (
            <View style={styles.dotsRow}>
              {allImages.map((_, idx) => (
                <View
                  key={idx}
                  style={[styles.dot, idx === activeImageIndex && styles.dotActive]}
                />
              ))}
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
            <StarRow rating={product.average_rating} />
            <Text style={styles.ratingValue}> {product.average_rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}> ({product.review_count} reviews)</Text>
            <Text style={styles.soldCount}> · {product.sold_count} sold</Text>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(effectivePrice)}</Text>
            {product.discount_price != null && (
              <Text style={styles.originalPrice}>{formatCurrency(product.price)}</Text>
            )}
            {product.discount_percentage > 0 && (
              <View style={styles.saveBadge}>
                <Text style={styles.saveText}>Save {product.discount_percentage}%</Text>
              </View>
            )}
          </View>

          {/* Stock */}
          <View style={[styles.stockBadge, { backgroundColor: product.in_stock ? '#E8F8EF' : '#FEE2E2', flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
            <IonIcon
              name={product.in_stock ? 'checkmark' : 'close'}
              size={14}
              color={stockColor}
            />
            <Text style={{ color: stockColor, fontSize: 13, fontWeight: '600' }}>
              {stockLabel}
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
                    style={[
                      styles.variantChip,
                      selectedVariant?.id === v.id && styles.activeVariantChip,
                    ]}
                    onPress={() => setSelectedVariant(v.id === selectedVariant?.id ? null : v)}
                  >
                    <Text style={[
                      styles.variantText,
                      selectedVariant?.id === v.id && { color: COLORS.white },
                    ]}>
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
                <IonIcon name="remove" size={20} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
              >
                <IonIcon name="add" size={20} color={COLORS.white} />
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
              <View style={styles.specTable}>
                {Object.entries(product.specifications).map(([key, value], idx) => (
                  <View
                    key={key}
                    style={[styles.specRow, idx % 2 === 0 && { backgroundColor: COLORS.grayLight }]}
                  >
                    <Text style={styles.specKey}>{key}</Text>
                    <Text style={styles.specValue}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reviews */}
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>
                Reviews ({product.review_count})
              </Text>
              <View style={styles.avgRatingBox}>
                <Text style={styles.avgRatingNum}>{product.average_rating.toFixed(1)}</Text>
                <StarRow rating={product.average_rating} size={13} />
              </View>
            </View>

            {reviewsLoading ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginTop: 12 }} />
            ) : reviews.length > 0 ? (
              reviews.slice(0, 5).map((r) => <ReviewCard key={r.id} review={r} />)
            ) : (
              <Text style={styles.noReviews}>No reviews yet. Be the first!</Text>
            )}
          </View>

          {/* Related Products */}
          {related.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>You May Also Like</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {related.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.relatedCard}
                    onPress={() => navigation.replace('ProductDetail', { slug: p.slug })}
                  >
                    <View style={styles.relatedImageBox}>
                      {p.thumbnail_url ? (
                        <Image
                          source={{ uri: p.thumbnail_url }}
                          style={styles.relatedImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <IonIcon name="bag-handle-outline" size={32} color={COLORS.border} />
                      )}
                    </View>
                    <Text style={styles.relatedName} numberOfLines={2}>{p.name}</Text>
                    <Text style={styles.relatedPrice}>{formatCurrency(p.effective_price)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* ── Bottom Action Buttons ── */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.cartBtn, (!product.in_stock || addingToCart) && styles.disabledBtn]}
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

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding, paddingTop: 48, paddingBottom: 8,
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1,
  },
  headerBtnText: { fontSize: 20, color: COLORS.text },
  headerRight: { flexDirection: 'row', gap: 10 },

  // Gallery
  galleryContainer: {
    width, height: IMAGE_HEIGHT, backgroundColor: COLORS.grayLight,
    marginTop: 80, position: 'relative',
  },
  galleryImage: { width, height: IMAGE_HEIGHT },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imageEmoji: { fontSize: 100 },
  discountBadge: {
    position: 'absolute', top: 16, right: 16,
    backgroundColor: COLORS.accent, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  discountText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  dotsRow: {
    position: 'absolute', bottom: 12, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: COLORS.white, width: 18 },

  // Content
  content: { padding: SIZES.screenPadding, backgroundColor: COLORS.white },
  brand: { fontSize: 12, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  name: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, lineHeight: 28, marginBottom: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' },
  ratingValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  reviewCount: { fontSize: 13, color: COLORS.textSecondary },
  soldCount: { fontSize: 13, color: COLORS.textMuted },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 },
  price: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary },
  originalPrice: { fontSize: 16, color: COLORS.textMuted, textDecorationLine: 'line-through' },
  saveBadge: {
    backgroundColor: '#FFF3E0', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  saveText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
  stockBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },

  // Variants
  variantList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  variantChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.grayLight,
  },
  activeVariantChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  variantText: { fontSize: 13, color: COLORS.text },

  // Quantity
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    elevation: 1, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25,
  },
  qtyBtnText: { fontSize: 20, color: COLORS.white, fontWeight: 'bold' },
  qtyValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, minWidth: 32, textAlign: 'center' },

  // Description
  description: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },

  // Specs
  specTable: { borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  specRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12 },
  specKey: { flex: 1, fontSize: 14, color: COLORS.textSecondary },
  specValue: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '500' },

  // Reviews
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  avgRatingBox: { alignItems: 'center' },
  avgRatingNum: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  noReviews: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 12 },

  // Related
  relatedCard: {
    width: 130, marginRight: 12, backgroundColor: COLORS.white,
    borderRadius: 10, overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08,
  },
  relatedImageBox: {
    width: 130, height: 110, backgroundColor: COLORS.grayLight,
    alignItems: 'center', justifyContent: 'center',
  },
  relatedImage: { width: 130, height: 110 },
  relatedName: { fontSize: 12, color: COLORS.text, padding: 6, lineHeight: 16 },
  relatedPrice: { fontSize: 13, fontWeight: 'bold', color: COLORS.primary, paddingHorizontal: 6, paddingBottom: 8 },

  // Bottom actions
  bottomActions: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', padding: 16, backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.border, gap: 12,
    paddingBottom: 32,
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.07,
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
  disabledBtn: { opacity: 0.45 },
});
