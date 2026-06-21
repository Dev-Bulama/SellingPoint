import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  FlatList, RefreshControl, Dimensions, Image, Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../../constants';
import { productsApi } from '../../api/products';
import { cmsApi } from '../../api/cms';
import { Product, Category, Banner } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { useCartStore } from '../../store/cartStore';
import IonIcon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const RECENTLY_VIEWED_KEY = 'recently_viewed';

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
    backgroundColor: COLORS.accent,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginHorizontal: 1,
  },
  digit: { color: COLORS.white, fontSize: 13, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  colon: { color: COLORS.accent, fontWeight: 'bold', fontSize: 14, marginHorizontal: 1 },
});

// ---------------------------------------------------------------------------
// ProductCard
// ---------------------------------------------------------------------------
function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.productImageBox}>
        {product.thumbnail_url ? (
          <Image
            source={{ uri: product.thumbnail_url }}
            style={styles.productImage}
            resizeMode="cover"
          />
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
// HomeScreen
// ---------------------------------------------------------------------------
export default function HomeScreen({ navigation }: any) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [flashSales, setFlashSales] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { fetchCart } = useCartStore();

  // Flash sale countdown: ends 2 hours from first render
  const flashSaleEnd = useRef(new Date(Date.now() + 2 * 3600 * 1000)).current;

  const loadRecentlyViewed = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
      if (raw) setRecentlyViewed(JSON.parse(raw));
    } catch {}
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [bannersRes, featuredRes, newArrRes, flashRes, catsRes] = await Promise.all([
        cmsApi.banners('slider').catch(() => ({ data: { data: [] } })),
        productsApi.featured().catch(() => ({ data: { data: [] } })),
        productsApi.newArrivals().catch(() => ({ data: { data: [] } })),
        productsApi.flashSales().catch(() => ({ data: { data: [] } })),
        productsApi.categories().catch(() => ({ data: { data: [] } })),
      ]);
      setBanners(bannersRes.data.data);
      setFeatured(featuredRes.data.data);
      setNewArrivals(newArrRes.data.data);
      setFlashSales(flashRes.data.data);
      setCategories(catsRes.data.data);
    } catch {}
  }, []);

  useEffect(() => {
    loadData();
    fetchCart();
    loadRecentlyViewed();
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
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello</Text>
          <Text style={styles.subGreeting}>What are you shopping for today?</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          style={styles.notifBtn}
        >
          <IonIcon name="notifications-outline" size={22} color={COLORS.text} />
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* ── Banner Slider ── */}
        {banners.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.bannerSlider}
          >
            {banners.map((banner) => (
              <TouchableOpacity
                key={banner.id}
                activeOpacity={0.95}
                style={styles.bannerItem}
                onPress={() => banner.link && goToList({ title: banner.title })}
              >
                {banner.image_url ? (
                  <Image
                    source={{ uri: banner.image_url }}
                    style={styles.bannerImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.bannerBg, { backgroundColor: banner.bg_color || COLORS.primary }]}>
                    <Text style={styles.bannerTitle}>{banner.title}</Text>
                    {banner.subtitle && (
                      <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                    )}
                    {banner.button_text && (
                      <View style={styles.bannerBtn}>
                        <Text style={styles.bannerBtnText}>{banner.button_text}</Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.bannerItem, { backgroundColor: COLORS.primary }]}>
            <View style={styles.bannerBg}>
              <Text style={styles.bannerTitle}>Mega Sale — Up to 50% Off!</Text>
              <Text style={styles.bannerSubtitle}>Shop top brands at unbeatable prices</Text>
              <TouchableOpacity style={styles.bannerBtn} onPress={() => goToList({ title: 'All Products' })}>
                <Text style={styles.bannerBtnText}>Shop Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Categories ── */}
        <SectionHeader title="Shop by Category" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
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
                  <IonIcon name="pricetag-outline" size={24} color={COLORS.text} />
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
                <Text style={styles.flashTitle}>Flash Sale</Text>
                <CountdownTimer endsAt={flashSaleEnd} />
              </View>
              <TouchableOpacity onPress={() => goToList({ title: 'Flash Sales' })}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={flashSales.slice(0, 8)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SIZES.screenPadding }}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <ProductCard product={item} onPress={() => goToProduct(item.slug)} />
              )}
            />
          </View>
        )}

        {/* ── Featured Products ── */}
        {featured.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Featured Products"
              onSeeAll={() => goToList({ title: 'Featured Products' })}
            />
            <FlatList
              data={featured.slice(0, 8)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SIZES.screenPadding }}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <ProductCard product={item} onPress={() => goToProduct(item.slug)} />
              )}
            />
          </View>
        )}

        {/* ── New Arrivals ── */}
        {newArrivals.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="New Arrivals"
              onSeeAll={() => goToList({ title: 'New Arrivals' })}
            />
            <FlatList
              data={newArrivals.slice(0, 8)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SIZES.screenPadding }}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <ProductCard product={item} onPress={() => goToProduct(item.slug)} />
              )}
            />
          </View>
        )}

        {/* ── Recently Viewed ── */}
        {recentlyViewed.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Recently Viewed" />
            <FlatList
              data={recentlyViewed}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SIZES.screenPadding }}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <ProductCard product={item} onPress={() => goToProduct(item.slug)} />
              )}
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

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding, paddingTop: 48, paddingBottom: 12,
    backgroundColor: COLORS.white,
  },
  greeting: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  subGreeting: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  notifBtn: { padding: 8 },
  notifIcon: { fontSize: 22 },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.grayLight, borderRadius: SIZES.borderRadius,
    marginHorizontal: SIZES.screenPadding, marginVertical: 12, padding: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchPlaceholder: { color: COLORS.textMuted, fontSize: 14 },

  // Banner
  bannerSlider: { marginBottom: 8 },
  bannerItem: {
    width: width - 32, marginHorizontal: 16, borderRadius: SIZES.borderRadiusLg,
    overflow: 'hidden', minHeight: 160, marginBottom: 8,
  },
  bannerImage: { width: '100%', height: 160 },
  bannerBg: {
    flex: 1, minHeight: 160, padding: 24, justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  bannerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white, marginBottom: 6 },
  bannerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 16 },
  bannerBtn: {
    backgroundColor: COLORS.white, alignSelf: 'flex-start',
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
  },
  bannerBtnText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },

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
  categoryEmoji: { fontSize: 24 },
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
    marginRight: 12,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4,
    overflow: 'hidden',
  },
  productImageBox: { width: '100%', height: 140, backgroundColor: COLORS.grayLight, position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  productImagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderEmoji: { fontSize: 48 },
  discountBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: COLORS.accent, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
  },
  discountText: { color: COLORS.white, fontSize: 11, fontWeight: 'bold' },
  productInfo: { padding: 10 },
  productName: { fontSize: 13, fontWeight: 'bold', color: COLORS.text, marginBottom: 4, lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  productPrice: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary, marginRight: 6 },
  originalPrice: { fontSize: 11, color: COLORS.textMuted, textDecorationLine: 'line-through' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  star: { fontSize: 11 },
  ratingText: { fontSize: 11, color: COLORS.text, marginLeft: 2 },
  soldText: { fontSize: 11, color: COLORS.textMuted },
});
