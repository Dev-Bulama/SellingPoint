import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  FlatList, RefreshControl, Dimensions, Image, ActivityIndicator, Linking,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../../constants';
import { productsApi } from '../../api/products';
import { cmsApi } from '../../api/cms';
import { Product, Category, Banner } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import IonIcon from 'react-native-vector-icons/Ionicons';
import AppAlert from '../../components/AppAlert';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width;
const RECENTLY_VIEWED_KEY = 'recently_viewed';
const SLIDE_INTERVAL = 3500;

// ---------------------------------------------------------------------------
// CountdownTimer
// ---------------------------------------------------------------------------
function CountdownTimer({ endsAt }: { endsAt: Date }) {
  const calcRemaining = () => {
    const diff = Math.max(0, endsAt.getTime() - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s, expired: diff <= 0 };
  };

  const [time, setTime] = useState(calcRemaining);

  useEffect(() => {
    if (time.expired) return;
    const id = setInterval(() => setTime(calcRemaining()), 1000);
    return () => clearInterval(id);
  }, [time.expired]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <View style={timerStyles.row}>
      <Text style={timerStyles.label}>Ends in: </Text>
      {(['h', 'm', 's'] as const).map((unit, idx) => (
        <React.Fragment key={unit}>
          <View style={timerStyles.block}>
            <Text style={timerStyles.digit}>{pad(time[unit])}</Text>
          </View>
          {idx < 2 && <Text style={timerStyles.colon}>:</Text>}
        </React.Fragment>
      ))}
    </View>
  );
}

const timerStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 12, color: COLORS.textSecondary, marginRight: 6 },
  block: {
    backgroundColor: COLORS.accent, borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 3, marginHorizontal: 1,
  },
  digit: { color: COLORS.white, fontSize: 13, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  colon: { color: COLORS.accent, fontWeight: 'bold', fontSize: 14, marginHorizontal: 1 },
});

// ---------------------------------------------------------------------------
// BannerItem
// ---------------------------------------------------------------------------
function BannerItem({ banner }: { banner: Banner }) {
  const [imgFailed, setImgFailed] = useState(false);
  const bgColor = banner.bg_color || COLORS.primary;

  if (!banner.image_url || imgFailed) {
    return (
      <View style={[styles.bannerInner, { backgroundColor: bgColor }]}>
        <Text style={styles.bannerTitle}>{banner.title}</Text>
        {banner.subtitle && <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>}
        {banner.button_text && (
          <View style={styles.bannerBtn}><Text style={styles.bannerBtnText}>{banner.button_text}</Text></View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.bannerInner}>
      <Image
        source={{ uri: banner.image_url }}
        style={styles.bannerImage}
        resizeMode="cover"
        onError={() => setImgFailed(true)}
      />
      {banner.button_text && (
        <View style={styles.bannerOverlay}>
          <View style={styles.bannerBtn}><Text style={styles.bannerBtnText}>{banner.button_text}</Text></View>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// AutoBannerSlider
// ---------------------------------------------------------------------------
function AutoBannerSlider({ banners, navigation }: { banners: Banner[]; navigation: any }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(0);
  const isDragging = useRef(false);

  const slideTo = useCallback((idx: number) => {
    if (!banners.length) return;
    const next = ((idx % banners.length) + banners.length) % banners.length;
    indexRef.current = next;
    setActiveIndex(next);
    scrollRef.current?.scrollTo({ x: next * BANNER_WIDTH, animated: true });
  }, [banners.length]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      if (!isDragging.current) slideTo(indexRef.current + 1);
    }, SLIDE_INTERVAL);
  }, [banners.length, slideTo]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / BANNER_WIDTH);
    if (idx !== indexRef.current) {
      indexRef.current = idx;
      setActiveIndex(idx);
    }
  };

  const handleBannerPress = useCallback((banner: Banner) => {
    const link = banner.link ?? '';
    const productMatch = link.match(/(?:\/products\/|product:)([^/?#]+)/);
    if (productMatch) { navigation.navigate('ProductDetail', { slug: productMatch[1] }); return; }
    const categoryMatch = link.match(/(?:\/categories\/|category:)(\d+)/);
    if (categoryMatch) { navigation.navigate('ProductList', { categoryId: Number(categoryMatch[1]), title: banner.title }); return; }
    if (link.startsWith('http')) { Linking.openURL(link); return; }
    navigation.navigate('ProductList', { title: banner.title || 'Shop Now' });
  }, [navigation]);

  if (banners.length === 0) {
    return (
      <View style={styles.bannerWrapper}>
        <TouchableOpacity style={styles.bannerItem} activeOpacity={0.95} onPress={() => navigation.navigate('ProductList', { title: 'All Products' })}>
          <View style={[styles.bannerInner, { backgroundColor: COLORS.primary }]}>
            <View style={styles.bannerBg}>
              <Text style={styles.bannerTitle}>Mega Sale — Up to 50% Off!</Text>
              <Text style={styles.bannerSubtitle}>Shop top brands at unbeatable prices</Text>
              <View style={styles.bannerBtn}><Text style={styles.bannerBtnText}>Shop Now</Text></View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.bannerWrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={false}
        snapToInterval={BANNER_WIDTH}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onScrollBeginDrag={() => {
          isDragging.current = true;
          if (timerRef.current) clearInterval(timerRef.current);
        }}
        onMomentumScrollEnd={() => {
          isDragging.current = false;
          startTimer();
        }}
      >
        {banners.map((item) => (
          <TouchableOpacity
            key={String(item.id)}
            style={styles.bannerItem}
            activeOpacity={0.92}
            onPress={() => handleBannerPress(item)}
          >
            <BannerItem banner={item} />
          </TouchableOpacity>
        ))}
      </ScrollView>
      {banners.length > 1 && (
        <View style={styles.dotsRow}>
          {banners.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// ProductCard
// ---------------------------------------------------------------------------
function ProductCard({
  product, onPress, onAddToCart,
}: {
  product: Product; onPress: () => void; onAddToCart?: (id: number) => void;
}) {
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e: any) => {
    e.stopPropagation();
    if (adding || !onAddToCart) return;
    setAdding(true);
    await onAddToCart(product.id);
    setAdding(false);
  };

  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.productImageBox}>
        {product.thumbnail_url ? (
          <Image source={{ uri: product.thumbnail_url }} style={styles.productImage} resizeMode="cover" />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <IonIcon name="bag-handle-outline" size={32} color={COLORS.border} />
          </View>
        )}
        {product.discount_percentage > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discount_percentage}%</Text>
          </View>
        )}
        {onAddToCart && (
          <TouchableOpacity style={styles.cartFab} onPress={handleAddToCart} activeOpacity={0.85} disabled={adding}>
            {adding
              ? <ActivityIndicator size="small" color={COLORS.white} />
              : <IonIcon name="cart-outline" size={16} color={COLORS.white} />}
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{formatCurrency(product.effective_price)}</Text>
          {product.discount_price != null && (
            <Text style={styles.originalPrice}>{formatCurrency(product.price)}</Text>
          )}
        </View>
        <View style={styles.ratingRow}>
          <IonIcon name="star" size={11} color="#F5A623" />
          <Text style={styles.ratingText}>{product.average_rating.toFixed(1)}</Text>
          <Text style={styles.soldText}> · {product.sold_count} sold</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// SectionHeader
// ---------------------------------------------------------------------------
function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Category icon map
// ---------------------------------------------------------------------------
const CATEGORY_ICONS: Record<string, string> = {
  'Electronics':        'phone-portrait-outline',
  'Fashion':            'shirt-outline',
  'Home & Living':      'home-outline',
  'Beauty & Health':    'flower-outline',
  'Sports & Outdoors':  'football-outline',
  'Groceries':          'cart-outline',
  'Smartphones':        'phone-portrait-outline',
  'Laptops':            'laptop-outline',
  'Tablets':            'tablet-portrait-outline',
  'Smart Watches':      'watch-outline',
  'Headphones':         'headset-outline',
  'Cameras':            'camera-outline',
  'Shoes':              'footsteps-outline',
  'Bags & Purses':      'bag-handle-outline',
  'Accessories':        'glasses-outline',
  'Furniture':          'bed-outline',
  'Kitchen & Dining':   'restaurant-outline',
  'Bedding':            'bed-outline',
  'Decor':              'color-palette-outline',
  'Lighting':           'bulb-outline',
  'Skincare':           'sparkles-outline',
  'Hair Care':          'cut-outline',
  'Makeup':             'rose-outline',
  'Fragrances':         'flower-outline',
  'Fresh Produce':      'leaf-outline',
  'Beverages':          'wine-outline',
  'Snacks':             'fast-food-outline',
};

function getCategoryIcon(name: string): string {
  return CATEGORY_ICONS[name] ?? 'pricetag-outline';
}

// ---------------------------------------------------------------------------
// HomeScreen
// ---------------------------------------------------------------------------
export default function HomeScreen({ navigation }: any) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [flashSales, setFlashSales] = useState<Product[]>([]);
  const [flashSaleEnd, setFlashSaleEnd] = useState<Date | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { fetchCart, cart, addItem } = useCartStore();
  const { user } = useAuthStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertProps, setAlertProps] = useState({ icon: '', iconColor: '', title: '', message: '', autoDismissMs: undefined as number | undefined });

  const handleAddToCart = useCallback(async (productId: number) => {
    const allProducts = [...flashSales, ...newArrivals, ...recentlyViewed];
    const product = allProducts.find(p => p.id === productId);
    setAlertProps({ icon: 'checkmark-circle', iconColor: COLORS.success, title: 'Added to Cart', message: `${product?.name ?? 'Item'} added successfully!`, autoDismissMs: 2500 });
    setAlertVisible(true);
    try {
      await addItem(productId, 1);
    } catch {
      setAlertProps({ icon: 'close-circle', iconColor: COLORS.danger, title: 'Error', message: 'Could not add to cart.', autoDismissMs: undefined });
      setAlertVisible(true);
    }
  }, [addItem, flashSales, newArrivals, recentlyViewed]);

  const firstName = user?.name?.trim().split(' ')[0] ?? '';

  const loadRecentlyViewed = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
      if (raw) setRecentlyViewed(JSON.parse(raw));
    } catch {}
  }, []);

  const loadData = useCallback(async () => {
    // Fire all requests in parallel; update state as each resolves so content appears progressively
    const safe = (p: Promise<any>, fallback: any) => p.catch(() => fallback);

    cmsApi.banners('slider')
      .then(r => setBanners(r.data.data))
      .catch(() => {});

    productsApi.categories()
      .then(r => setCategories(r.data.data))
      .catch(() => {});

    productsApi.featured()
      .then(r => setFeatured(r.data.data))
      .catch(() => {});

    productsApi.flashSales()
      .then(r => setFlashSales(r.data.data))
      .catch(() => {});

    productsApi.newArrivals()
      .then(r => setNewArrivals(r.data.data))
      .catch(() => {});

    cmsApi.flashSales()
      .then(r => {
        const list = r.data.data;
        if (Array.isArray(list) && list.length > 0 && list[0].ends_at) {
          setFlashSaleEnd(new Date(list[0].ends_at));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadData();
    fetchCart();
    loadRecentlyViewed();
    fetchUnreadCount();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadData(), loadRecentlyViewed()]);
    setRefreshing(false);
  };

  const goToProduct = (slug: string) => navigation.navigate('ProductDetail', { slug });
  const goToList = (params: any) => navigation.navigate('ProductList', params);

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
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hello{firstName ? `, ${firstName}` : ''} 👋
          </Text>
          <Text style={styles.subGreeting}>What are you shopping for today?</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.notifBtn}>
          <View>
            <IonIcon name="notifications-outline" size={22} color={COLORS.text} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Search bar ── */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => navigation.navigate('ProductList', { title: 'Search Products' })}
        activeOpacity={0.8}
      >
        <IonIcon name="search" size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
        <Text style={styles.searchPlaceholder}>Search products, brands...</Text>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* ── Auto-sliding Banner ── */}
        <AutoBannerSlider banners={banners} navigation={navigation} />

        {/* ── Categories ── */}
        <SectionHeader title="Shop by Category" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {categories.slice(0, 10).map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryItem}
              onPress={() => goToList({ categoryId: cat.id, title: cat.name })}
            >
              <View style={styles.categoryIconBox}>
                {cat.image_url ? (
                  <Image source={{ uri: cat.image_url }} style={styles.categoryImage} resizeMode="cover" />
                ) : (
                  <IonIcon name={getCategoryIcon(cat.name)} size={24} color={COLORS.primary} />
                )}
              </View>
              <Text style={styles.categoryName} numberOfLines={2}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Flash Sales ── */}
        {flashSales.length > 0 && (
          <View style={styles.flashSaleSection}>
            <View style={styles.flashHeader}>
              <View style={styles.flashTitleRow}>
                <Text style={styles.flashTitle}>⚡ Flash Sale</Text>
                {flashSaleEnd && <CountdownTimer endsAt={flashSaleEnd} />}
              </View>
              <TouchableOpacity onPress={() => goToList({ title: 'Flash Sales' })}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={flashSales.slice(0, 8)} horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SIZES.screenPadding }}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <ProductCard product={item} onPress={() => goToProduct(item.slug)} onAddToCart={handleAddToCart} />}
            />
          </View>
        )}

        {/* ── Featured Products ── */}
        {featured.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Featured Products" onSeeAll={() => goToList({ title: 'Featured Products' })} />
            <FlatList
              data={featured.slice(0, 8)} horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SIZES.screenPadding }}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <ProductCard product={item} onPress={() => goToProduct(item.slug)} onAddToCart={handleAddToCart} />}
            />
          </View>
        )}

        {/* ── New Arrivals ── */}
        {newArrivals.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="New Arrivals" onSeeAll={() => goToList({ title: 'New Arrivals' })} />
            <FlatList
              data={newArrivals.slice(0, 8)} horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SIZES.screenPadding }}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <ProductCard product={item} onPress={() => goToProduct(item.slug)} onAddToCart={handleAddToCart} />}
            />
          </View>
        )}

        {/* ── Recently Viewed ── */}
        {recentlyViewed.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Recently Viewed" />
            <FlatList
              data={recentlyViewed} horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SIZES.screenPadding }}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <ProductCard product={item} onPress={() => goToProduct(item.slug)} onAddToCart={handleAddToCart} />}
            />
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding, paddingTop: 48, paddingBottom: 12,
    backgroundColor: COLORS.white,
  },
  greeting: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  subGreeting: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  notifBtn: { padding: 8 },
  notifBadge: {
    position: 'absolute', top: -4, right: -6,
    backgroundColor: COLORS.danger, borderRadius: 9,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  notifBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.grayLight, borderRadius: SIZES.borderRadius,
    marginHorizontal: SIZES.screenPadding, marginVertical: 12, padding: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchPlaceholder: { color: COLORS.textMuted, fontSize: 14 },

  // Banner
  bannerWrapper: { marginBottom: 4 },
  bannerItem: {
    width: BANNER_WIDTH, paddingHorizontal: 16, height: 160,
  },
  bannerInner: {
    flex: 1, borderRadius: SIZES.borderRadiusLg, overflow: 'hidden',
  },
  bannerImage: { flex: 1 },
  bannerBg: {
    flex: 1, padding: 24, justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  bannerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white, marginBottom: 6 },
  bannerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 16 },
  bannerBtn: {
    backgroundColor: COLORS.white, alignSelf: 'flex-start',
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
  },
  bannerBtnText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },
  bannerOverlay: {
    position: 'absolute', bottom: 14, left: 24,
  },
  dotsRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: 10, marginBottom: 4,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: COLORS.border, marginHorizontal: 3,
  },
  dotActive: {
    width: 18, height: 6, borderRadius: 3,
    backgroundColor: COLORS.primary,
  },

  // Section
  section: { marginBottom: 4 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding, marginTop: 20, marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text },
  seeAll: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },

  // Category
  categoryList: { paddingHorizontal: SIZES.screenPadding, paddingBottom: 4 },
  categoryItem: { width: 70, marginRight: 12, alignItems: 'center' },
  categoryIconBox: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.grayLight, alignItems: 'center', justifyContent: 'center',
    marginBottom: 6, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  categoryImage: { width: 56, height: 56, borderRadius: 28 },
  categoryName: { fontSize: 11, color: COLORS.text, textAlign: 'center', lineHeight: 14 },

  // Flash Sale
  flashSaleSection: { backgroundColor: COLORS.white, marginBottom: 8, paddingVertical: 16 },
  flashHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding, marginBottom: 12,
  },
  flashTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flashTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.accent },

  // Product Card
  productCard: {
    width: 160, backgroundColor: COLORS.white, borderRadius: SIZES.borderRadius,
    marginRight: 12, marginBottom: 4,
    elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6,
  },
  productImageBox: {
    width: '100%', height: 140, backgroundColor: COLORS.grayLight, position: 'relative',
    borderTopLeftRadius: SIZES.borderRadius, borderTopRightRadius: SIZES.borderRadius, overflow: 'hidden',
  },
  productImage: { width: '100%', height: '100%' },
  productImagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  discountBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: COLORS.accent, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
  },
  discountText: { color: COLORS.white, fontSize: 11, fontWeight: 'bold' },
  cartFab: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: COLORS.primary, borderRadius: 16,
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
    elevation: 3,
  },
  productInfo: { padding: 10 },
  productName: { fontSize: 13, fontWeight: 'bold', color: COLORS.text, marginBottom: 4, lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  productPrice: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary, marginRight: 6 },
  originalPrice: { fontSize: 11, color: COLORS.textMuted, textDecorationLine: 'line-through' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 11, color: COLORS.text, marginLeft: 2 },
  soldText: { fontSize: 11, color: COLORS.textMuted },
});
