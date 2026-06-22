import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, ScrollView, Image,
} from 'react-native';
import { COLORS, SIZES } from '../../constants';
import { productsApi } from '../../api/products';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/currency';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useCartStore } from '../../store/cartStore';
import AppAlert from '../../components/AppAlert';

const SORT_OPTIONS = [
  { label: 'Latest',      value: 'latest' },
  { label: 'Price: Low',  value: 'price_asc' },
  { label: 'Price: High', value: 'price_desc' },
  { label: 'Popular',     value: 'popular' },
  { label: 'Rating',      value: 'rating' },
];

function ProductGridItem({ product, onPress, onAddToCart }: {
  product: Product; onPress: () => void; onAddToCart: (id: number) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);

  const handleCart = async (e: any) => {
    e.stopPropagation();
    if (adding) return;
    setAdding(true);
    await onAddToCart(product.id);
    setAdding(false);
  };

  return (
    <TouchableOpacity style={styles.gridItem} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.gridImageBox}>
        {product.thumbnail_url ? (
          <Image source={{ uri: product.thumbnail_url }} style={styles.gridImage} resizeMode="cover" />
        ) : (
          <IonIcon name="bag-handle-outline" size={52} color={COLORS.border} />
        )}
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
        <TouchableOpacity style={styles.cartFab} onPress={handleCart} disabled={adding} activeOpacity={0.85}>
          {adding
            ? <ActivityIndicator size="small" color={COLORS.white} />
            : <IonIcon name="cart-outline" size={16} color={COLORS.white} />}
        </TouchableOpacity>
      </View>
      <View style={styles.gridInfo}>
        <Text style={styles.gridName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.gridPrice}>{formatCurrency(product.effective_price)}</Text>
        {product.discount_price && (
          <Text style={styles.gridOriginal}>{formatCurrency(product.price)}</Text>
        )}
        <View style={styles.ratingRow}>
          <IonIcon name="star" size={11} color="#F5A623" />
          <Text style={[styles.star, { marginLeft: 2 }]}>{product.average_rating.toFixed(1)}</Text>
          <Text style={styles.soldText}> · {product.sold_count}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ProductListScreen({ route, navigation }: any) {
  const { categoryId, brandId, title = 'Products', search } = route.params || {};
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState(search || '');
  const [sort, setSort] = useState('latest');
  const [error, setError] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertProps, setAlertProps] = useState({ icon: '', iconColor: '', title: '', message: '', autoDismissMs: undefined as number | undefined });
  const { addItem } = useCartStore();

  const handleAddToCart = async (productId: number) => {
    const product = products.find(p => p.id === productId);
    setAlertProps({ icon: 'checkmark-circle', iconColor: COLORS.success, title: 'Added to Cart', message: `${product?.name ?? 'Item'} added successfully!`, autoDismissMs: 2500 });
    setAlertVisible(true);
    try {
      await addItem(productId, 1);
    } catch {
      setAlertProps({ icon: 'close-circle', iconColor: COLORS.danger, title: 'Error', message: 'Could not add to cart. Please try again.', autoDismissMs: undefined });
      setAlertVisible(true);
    }
  };

  const loadingRef = useRef(false);
  const pageRef = useRef(1);
  const lastPageRef = useRef(1);

  const loadProducts = useCallback(async (reset = false) => {
    if (loadingRef.current) return;
    const currentPage = reset ? 1 : pageRef.current;
    if (!reset && currentPage > lastPageRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);
    if (reset) setError('');
    try {
      const res = await productsApi.list({
        category_id: categoryId,
        brand_id: brandId,
        search: searchText || undefined,
        sort: sort as any,
        page: currentPage,
        per_page: 20,
      });
      const newProducts: Product[] = res.data.data;
      const meta = res.data.meta;
      lastPageRef.current = meta.last_page;
      pageRef.current = reset ? 2 : currentPage + 1;
      setProducts(prev => reset ? newProducts : [...prev, ...newProducts]);
    } catch (e: any) {
      if (reset) {
        const msg = e?.response?.data?.message || e?.message || 'Failed to load products';
        setError(msg);
      }
    }
    loadingRef.current = false;
    setIsLoading(false);
  }, [categoryId, brandId, searchText, sort]);

  useEffect(() => {
    pageRef.current = 1;
    lastPageRef.current = 1;
    loadProducts(true);
  }, [categoryId, brandId, sort]);

  const onRefresh = async () => {
    setRefreshing(true);
    pageRef.current = 1;
    lastPageRef.current = 1;
    await loadProducts(true);
    setRefreshing(false);
  };

  const handleSearch = () => {
    pageRef.current = 1;
    lastPageRef.current = 1;
    loadProducts(true);
  };

  const handleEndReached = () => {
    if (products.length > 0 && pageRef.current <= lastPageRef.current) {
      loadProducts(false);
    }
  };

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
      {/* Fixed header — never scrolls away */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <IonIcon name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Fixed search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <IonIcon name="search" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#BDBDBD"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchText(''); handleSearch(); }}>
              <IonIcon name="close-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Fixed sort chips — always visible */}
      <View style={styles.sortBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortRow}
          keyboardShouldPersistTaps="handled"
        >
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
        </ScrollView>
      </View>

      {/* Scrollable product grid */}
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.grid}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        renderItem={({ item }) => (
          <ProductGridItem product={item} onPress={() => navigation.navigate('ProductDetail', { slug: item.slug })} onAddToCart={handleAddToCart} />
        )}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={isLoading ? <ActivityIndicator color={COLORS.primary} style={{ margin: 16 }} /> : null}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <IonIcon name={error ? 'warning-outline' : 'search'} size={64} color={COLORS.border} style={{ marginBottom: 16 }} />
              <Text style={styles.emptyText}>{error ? 'Could not load products' : 'No products found'}</Text>
              <Text style={styles.emptySubtext}>{error || 'Try different search terms or filters'}</Text>
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
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text },
  searchRow: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16, paddingBottom: 10,
  },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.grayLight, borderRadius: SIZES.borderRadius,
    paddingHorizontal: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: COLORS.text },
  sortBar: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  sortRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  sortChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: COLORS.grayLight,
    borderWidth: 1, borderColor: COLORS.border,
  },
  activeSortChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sortText: { fontSize: 12, color: COLORS.text },
  activeSortText: { color: COLORS.white, fontWeight: '600' },
  grid: { padding: 8, flexGrow: 1 },
  gridItem: {
    flex: 1, margin: 6, backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6,
  },
  gridImageBox: {
    height: 160, backgroundColor: COLORS.grayLight,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
    borderTopLeftRadius: SIZES.borderRadius, borderTopRightRadius: SIZES.borderRadius, overflow: 'hidden',
  },
  gridImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  cartFab: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: COLORS.primary, borderRadius: 16,
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
  },
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48, marginTop: 40 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
});
