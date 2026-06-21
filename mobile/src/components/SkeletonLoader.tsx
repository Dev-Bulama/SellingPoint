/**
 * SkeletonLoader — animated shimmer placeholders for loading states.
 * Uses only React Native's built-in Animated API (no external deps).
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import { COLORS, SIZES } from '../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Base Skeleton
// ---------------------------------------------------------------------------
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.75],
  });

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: COLORS.grayMedium,
          opacity,
        },
        style,
      ]}
    />
  );
}

// ---------------------------------------------------------------------------
// ProductCardSkeleton  (2-column grid card)
// ---------------------------------------------------------------------------
export function ProductCardSkeleton() {
  const cardWidth = (SCREEN_WIDTH - SIZES.screenPadding * 2 - 12) / 2;

  return (
    <View style={[skeletonStyles.card, { width: cardWidth }]}>
      {/* Image area */}
      <Skeleton width="100%" height={140} borderRadius={0} />
      {/* Info area */}
      <View style={skeletonStyles.info}>
        <Skeleton width="90%" height={13} borderRadius={6} style={{ marginBottom: 8 }} />
        <Skeleton width="70%" height={13} borderRadius={6} style={{ marginBottom: 10 }} />
        <Skeleton width="50%" height={15} borderRadius={6} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={11} borderRadius={6} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// BannerSkeleton  (full-width hero)
// ---------------------------------------------------------------------------
export function BannerSkeleton() {
  return (
    <View style={skeletonStyles.bannerWrapper}>
      <Skeleton
        width={SCREEN_WIDTH - SIZES.screenPadding * 2}
        height={160}
        borderRadius={SIZES.borderRadiusLg}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// ProductListSkeleton  (6 cards, 2-per-row grid)
// ---------------------------------------------------------------------------
export function ProductListSkeleton() {
  return (
    <View style={skeletonStyles.gridWrapper}>
      {Array.from({ length: 6 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// CategoryRowSkeleton  (horizontal pill row)
// ---------------------------------------------------------------------------
export function CategoryRowSkeleton() {
  return (
    <View style={skeletonStyles.categoryRow}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={skeletonStyles.categoryItem}>
          <Skeleton width={56} height={56} borderRadius={28} style={{ marginBottom: 6 }} />
          <Skeleton width={48} height={10} borderRadius={5} />
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    marginRight: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
  },
  info: { padding: 10 },
  bannerWrapper: {
    paddingHorizontal: SIZES.screenPadding,
    marginBottom: 8,
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.screenPadding,
    gap: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.screenPadding,
    gap: 12,
  },
  categoryItem: { alignItems: 'center' },
});
