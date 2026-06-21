import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IonIcon from 'react-native-vector-icons/Ionicons';
import apiClient from '../../api/client';
import { COLORS, SIZES } from '../../constants';
import { Product, Category } from '../../types';

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT = 8;

function formatPrice(amount: number) {
  return `₦${amount.toLocaleString('en-NG')}`;
}

interface ProductCardProps {
  item: Product;
  onPress: () => void;
}

function ProductCard({ item, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress} activeOpacity={0.8}>
      {item.thumbnail_url ? (
        <Image source={{ uri: item.thumbnail_url }} style={styles.productImage} resizeMode="cover" />
      ) : (
        <View style={[styles.productImage, styles.productImagePlaceholder]}>
          <IonIcon name="bag-handle-outline" size={36} color={COLORS.border} />
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        {item.discount_price ? (
          <View>
            <Text style={styles.productPriceDiscounted}>{formatPrice(item.discount_price)}</Text>
            <Text style={styles.productPriceOriginal}>{formatPrice(item.price)}</Text>
          </View>
        ) : (
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
        )}
        {item.discount_percentage > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>-{item.discount_percentage}%</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function SearchScreen({ navigation }: any) {
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingCategories, setTrendingCategories] = useState<Category[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  // Load recent searches and trending categories on mount
  useEffect(() => {
    loadRecentSearches();
    loadTrendingCategories();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const raw = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (raw) setRecentSearches(JSON.parse(raw));
    } catch {}
  };

  const saveRecentSearch = async (term: string) => {
    try {
      const trimmed = term.trim();
      if (!trimmed) return;
      const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, MAX_RECENT);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {}
  };

  const clearRecentSearches = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  const loadTrendingCategories = async () => {
    try {
      const res = await apiClient.get('/categories');
      const categories: Category[] = res.data?.data ?? res.data ?? [];
      setTrendingCategories(categories.slice(0, 8));
    } catch {
      // Silently fail — categories are decorative
    } finally {
      setCategoriesLoading(false);
    }
  };

  const performSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await apiClient.get('/products', {
        params: { search: trimmed, per_page: 10 },
      });
      const products: Product[] = res.data?.data ?? res.data ?? [];
      setResults(products);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(text);
    }, 400);
  };

  const handleSubmitSearch = () => {
    if (query.trim()) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      saveRecentSearch(query.trim());
      performSearch(query.trim());
      Keyboard.dismiss();
    }
  };

  const handleRecentTap = (term: string) => {
    setQuery(term);
    saveRecentSearch(term);
    performSearch(term);
    Keyboard.dismiss();
  };

  const handleCategoryTap = (category: Category) => {
    navigation.navigate('ProductList', { categoryId: category.id, title: category.name });
  };

  const handleProductTap = (product: Product) => {
    saveRecentSearch(query.trim());
    navigation.navigate('ProductDetail', { slug: product.slug });
  };

  const handleClearInput = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const showLanding = !hasSearched && !isSearching;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <IonIcon name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <IonIcon name="search" size={16} color={COLORS.textMuted} style={{ marginRight: SIZES.xs }} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search products..."
            placeholderTextColor={COLORS.placeholder}
            value={query}
            onChangeText={handleQueryChange}
            onSubmitEditing={handleSubmitSearch}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClearInput} style={styles.clearButton}>
              <IonIcon name="close-circle" size={18} color={COLORS.grayDark} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Body */}
      {showLanding ? (
        <ScrollView
          style={styles.landingContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text style={styles.clearAllText}>Clear all</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.chipRow}>
                {recentSearches.map((term, index) => (
                  <TouchableOpacity
                    key={`${term}-${index}`}
                    style={styles.chip}
                    onPress={() => handleRecentTap(term)}
                    activeOpacity={0.7}
                  >
                    <IonIcon name="time-outline" size={12} color={COLORS.textSecondary} />
                    <Text style={styles.chipText}>{term}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Trending Categories */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Browse Categories</Text>
            </View>
            {categoriesLoading ? (
              <ActivityIndicator color={COLORS.primary} style={styles.loadingInline} />
            ) : (
              <View style={styles.categoryGrid}>
                {trendingCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.categoryChip}
                    onPress={() => handleCategoryTap(cat)}
                    activeOpacity={0.7}
                  >
                    {cat.icon ? (
                      <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                    ) : (
                      <IonIcon name="pricetag-outline" size={16} color={COLORS.text} />
                    )}
                    <Text style={styles.categoryChipText} numberOfLines={1}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      ) : isSearching ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.centered}>
          <IonIcon name="search" size={60} color={COLORS.border} style={{ marginBottom: SIZES.base }} />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySubtitle}>
            We couldn't find anything for "{query}".{'\n'}Try a different keyword.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleClearInput}>
            <Text style={styles.retryButtonText}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </Text>
          </View>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.resultsList}
            columnWrapperStyle={styles.resultsRow}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ProductCard item={item} onPress={() => handleProductTap(item)} />
            )}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const CARD_WIDTH = (SIZES.screenPadding * 2 + SIZES.sm) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SIZES.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: COLORS.text,
    fontWeight: '600',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grayLight,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: SIZES.sm,
    height: 44,
  },
  inputSearchIcon: {
    fontSize: 16,
    marginRight: SIZES.xs,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    height: 44,
  },
  clearButton: {
    padding: SIZES.xs,
  },
  clearIcon: {
    fontSize: 14,
    color: COLORS.grayDark,
    fontWeight: '600',
  },
  landingContainer: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SIZES.screenPadding,
    paddingTop: SIZES.base,
    paddingBottom: SIZES.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  clearAllText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadiusLg,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  chipIcon: {
    fontSize: 12,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.text,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs + 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  categoryChipIcon: {
    fontSize: 16,
  },
  categoryChipText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
    maxWidth: 100,
  },
  loadingInline: {
    marginTop: SIZES.base,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.screenPadding * 2,
  },
  loadingText: {
    marginTop: SIZES.sm,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: SIZES.base,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: SIZES.xl,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.borderRadius,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  resultsHeader: {
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: SIZES.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultsCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  resultsList: {
    padding: SIZES.screenPadding,
  },
  resultsRow: {
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  productCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  productImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.grayLight,
  },
  productImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImagePlaceholderText: {
    fontSize: 36,
  },
  productInfo: {
    padding: SIZES.sm,
  },
  productName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SIZES.xs,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  productPriceDiscounted: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  productPriceOriginal: {
    fontSize: 11,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    marginTop: SIZES.xs,
    alignSelf: 'flex-start',
    backgroundColor: '#FFF3E0',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  discountBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
