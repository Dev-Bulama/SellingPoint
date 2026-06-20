import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl,
} from 'react-native';
import { COLORS, SIZES } from '../../constants';
import { productsApi } from '../../api/products';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/currency';

const SORT_OPTIONS = [
  { label: 'Latest', value: 'latest' },
  { label: 'Price ↑', value: 'price_asc' },
  { label: 'Price ↓', value: 'price_desc' },
  { label: 'Popular', value: 'popular' },
  { label: 'Rating', value: 'rating' },
];

function ProductGridItem({ product, onPress }: { product: Product; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.gridItem} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.gridImageBox}>
        <Text style={styles.gridEmoji}>🛍️</Text>
        {product.discount_percentage > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discount_percentage}%</Text>
          </View>
        )}
        {!product.in_stock && (
          <View style={styles.outOfStock}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
      <View style={styles.gridInfo}>
        <Text style={styles.gridName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.gridPrice}>{formatCurrency(product.effective_price)}</Text>
        {product.discount_price && (
          <Text style={styles.gridOriginal}>{formatCurrency(product.price)}</Text>
        )}
        <View style={styles.ratingRow}>
          <Text style={styles.star}>⭐ {product.average_rating.toFixed(1)}</Text>
          <Text style={styles.soldText}> · {product.sold_count}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ProductListScreen({ route, navigation }: any) {
  const { categoryId, brandId, title = 'Products', search } = route.params || {};
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState(search || '');
  const [sort, setSort] = useState('latest');

  const loadProducts = useCallback(async (reset = false) => {
    if (isLoading) return;
    const currentPage = reset ? 1 : page;
    if (!reset && currentPage > lastPage) return;

    setIsLoading(true);
    try {
      const res = await productsApi.list({
        category_id: categoryId,
        brand_id: brandId,
        search: searchText || undefined,
        sort: sort as any,
        page: currentPage,
        per_page: 20,
      });
      const newProducts = res.data.data;
      setProducts(reset ? newProducts : [...products, ...newProducts]);
      setLastPage(res.data.meta.last_page);
      setPage(reset ? 2 : currentPage + 1);
    } catch {}
    setIsLoading(false);
  }, [categoryId, brandId, searchText, sort, page, lastPage, isLoading]);

  useEffect(() => { loadProducts(true); }, [categoryId, brandId, sort]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts(true);
    setRefreshing(false);
  };

  const handleSearch = () => loadProducts(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.sortChip, sort === opt.value && styles.activeSortChip]}
            onPress={() => setSort(opt.value)}
          >
            <Text style={[styles.sortText, sort === opt.value && styles.activeSortText]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.grid}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        renderItem={({ item }) => (
          <ProductGridItem product={item} onPress={() => navigation.navigate('ProductDetail', { slug: item.slug })} />
        )}
        onEndReached={() => loadProducts()}
        onEndReachedThreshold={0.3}
        ListFooterComponent={isLoading ? <ActivityIndicator color={COLORS.primary} style={{ margin: 16 }} /> : null}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>Try different search terms or filters</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.screenPadding, paddingTop: 48, paddingBottom: 12,
    backgroundColor: COLORS.white,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 22, color: COLORS.text },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text },
  searchRow: { backgroundColor: COLORS.white, paddingHorizontal: 16, paddingBottom: 12 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.grayLight, borderRadius: SIZES.borderRadius,
    paddingHorizontal: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  searchIcon: { fontSize: 14, marginRight: 6 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: COLORS.text },
  sortRow: {
    flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: 12,
    paddingBottom: 12, gap: 8,
  },
  sortChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, backgroundColor: COLORS.grayLight,
    borderWidth: 1, borderColor: COLORS.border,
  },
  activeSortChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sortText: { fontSize: 12, color: COLORS.text },
  activeSortText: { color: COLORS.white, fontWeight: '600' },
  grid: { padding: 8 },
  gridItem: {
    flex: 1, margin: 6, backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius, overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  gridImageBox: {
    height: 160, backgroundColor: COLORS.grayLight,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  gridEmoji: { fontSize: 52 },
  discountBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: COLORS.accent, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
  },
  discountText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },
  outOfStock: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', padding: 4, alignItems: 'center',
  },
  outOfStockText: { color: COLORS.white, fontSize: 11 },
  gridInfo: { padding: 10 },
  gridName: { fontSize: 13, color: COLORS.text, marginBottom: 4, lineHeight: 18 },
  gridPrice: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary, marginBottom: 2 },
  gridOriginal: { fontSize: 11, color: COLORS.textMuted, textDecorationLine: 'line-through', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  star: { fontSize: 11, color: COLORS.text },
  soldText: { fontSize: 11, color: COLORS.textMuted },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
});
