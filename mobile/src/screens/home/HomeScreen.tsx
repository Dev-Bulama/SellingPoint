import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, FlatList, RefreshControl, Dimensions,
} from 'react-native';
import { COLORS, SIZES } from '../../constants';
import { productsApi } from '../../api/products';
import { cmsApi } from '../../api/cms';
import { Product, Category, Banner } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { useCartStore } from '../../store/cartStore';

const { width } = Dimensions.get('window');

function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.productImageBox}>
        {product.thumbnail_url ? (
          <View style={styles.productImagePlaceholder}>
            <Text style={styles.productImageEmoji}>🛍️</Text>
          </View>
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Text style={styles.productImageEmoji}>🛍️</Text>
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
          {product.discount_price && (
            <Text style={styles.originalPrice}>{formatCurrency(product.price)}</Text>
          )}
        </View>
        <View style={styles.ratingRow}>
          <Text style={styles.star}>⭐</Text>
          <Text style={styles.ratingText}>{product.average_rating.toFixed(1)}</Text>
          <Text style={styles.soldText}> · {product.sold_count} sold</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

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

export default function HomeScreen({ navigation }: any) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [flashSales, setFlashSales] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { fetchCart } = useCartStore();

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
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const goToProduct = (slug: string) => navigation.navigate('ProductDetail', { slug });
  const goToList = (params: any) => navigation.navigate('ProductList', params);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello 👋</Text>
          <Text style={styles.subGreeting}>What are you shopping for today?</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          style={styles.notifBtn}
        >
          <Text style={styles.notifIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => navigation.navigate('ProductList', { title: 'Search Products' })}
        activeOpacity={0.8}
      >
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>Search products, brands...</Text>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Banner Slider */}
        {banners.length > 0 && (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.bannerSlider}>
            {banners.map((banner) => (
              <View key={banner.id} style={[styles.bannerItem, { backgroundColor: banner.bg_color || COLORS.primary }]}>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                {banner.subtitle && <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>}
                {banner.button_text && (
                  <TouchableOpacity style={styles.bannerBtn}>
                    <Text style={styles.bannerBtnText}>{banner.button_text}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        )}

        {banners.length === 0 && (
          <View style={[styles.bannerItem, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.bannerTitle}>Mega Sale — Up to 50% Off!</Text>
            <Text style={styles.bannerSubtitle}>Shop top brands at unbeatable prices</Text>
            <TouchableOpacity style={styles.bannerBtn} onPress={() => goToList({ title: 'All Products' })}>
              <Text style={styles.bannerBtnText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Categories */}
        <SectionHeader title="Shop by Category" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {categories.slice(0, 8).map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryItem}
              onPress={() => goToList({ categoryId: cat.id, title: cat.name })}>
              <View style={styles.categoryIcon}>
                <Text style={styles.categoryEmoji}>🏷️</Text>
              </View>
              <Text style={styles.categoryName} numberOfLines={2}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Flash Sales */}
        {flashSales.length > 0 && (
          <View style={styles.flashSaleSection}>
            <View style={styles.flashHeader}>
              <Text style={styles.flashTitle}>⚡ Flash Sale</Text>
              <TouchableOpacity onPress={() => goToList({ title: 'Flash Sales' })}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={flashSales.slice(0, 6)}
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

        {/* Featured */}
        {featured.length > 0 && (
          <>
            <SectionHeader title="Featured Products" onSeeAll={() => goToList({ title: 'Featured Products' })} />
            <FlatList
              data={featured.slice(0, 6)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SIZES.screenPadding }}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <ProductCard product={item} onPress={() => goToProduct(item.slug)} />
              )}
            />
          </>
        )}

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <>
            <SectionHeader title="New Arrivals" onSeeAll={() => goToList({ title: 'New Arrivals' })} />
            <FlatList
              data={newArrivals.slice(0, 6)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SIZES.screenPadding }}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <ProductCard product={item} onPress={() => goToProduct(item.slug)} />
              )}
            />
          </>
        )}

        <View style={{ height: 24 }} />
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
  notifIcon: { fontSize: 22 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.grayLight, borderRadius: SIZES.borderRadius,
    marginHorizontal: SIZES.screenPadding, marginVertical: 12, padding: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchPlaceholder: { color: COLORS.textMuted, fontSize: 14 },
  bannerSlider: { marginBottom: 8 },
  bannerItem: {
    width: width - 32, marginHorizontal: 16, borderRadius: SIZES.borderRadiusLg,
    padding: 24, minHeight: 140, justifyContent: 'center', marginBottom: 8,
  },
  bannerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white, marginBottom: 6 },
  bannerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 16 },
  bannerBtn: {
    backgroundColor: COLORS.white, alignSelf: 'flex-start',
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
  },
  bannerBtnText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding, marginTop: 20, marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text },
  seeAll: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  categoryList: { paddingHorizontal: SIZES.screenPadding, paddingBottom: 4 },
  categoryItem: { width: 70, marginRight: 12, alignItems: 'center' },
  categoryIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.grayLight, alignItems: 'center', justifyContent: 'center', marginBottom: 6,
    borderWidth: 1, borderColor: COLORS.border,
  },
  categoryEmoji: { fontSize: 24 },
  categoryName: { fontSize: 11, color: COLORS.text, textAlign: 'center', lineHeight: 14 },
  flashSaleSection: { backgroundColor: COLORS.white, marginBottom: 8, paddingVertical: 16 },
  flashHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding, marginBottom: 12,
  },
  flashTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.accent },
  productCard: {
    width: 160, backgroundColor: COLORS.white, borderRadius: SIZES.borderRadius,
    marginRight: 12, elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
    overflow: 'hidden',
  },
  productImageBox: { width: '100%', height: 140, backgroundColor: COLORS.grayLight, position: 'relative' },
  productImagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  productImageEmoji: { fontSize: 48 },
  discountBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: COLORS.accent, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
  },
  discountText: { color: COLORS.white, fontSize: 11, fontWeight: 'bold' },
  productInfo: { padding: 10 },
  productName: { fontSize: 13, color: COLORS.text, marginBottom: 4, lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary, marginRight: 6 },
  originalPrice: { fontSize: 11, color: COLORS.textMuted, textDecorationLine: 'line-through' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  star: { fontSize: 11 },
  ratingText: { fontSize: 11, color: COLORS.text, marginLeft: 2 },
  soldText: { fontSize: 11, color: COLORS.textMuted },
});
