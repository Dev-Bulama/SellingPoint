import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../../constants';

interface NoInternetScreenProps {
  onRetry: () => void;
}

export default function NoInternetScreen({ onRetry }: NoInternetScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📶</Text>
          <View style={styles.xMark}>
            <Text style={styles.xMarkText}>✕</Text>
          </View>
        </View>

        <Text style={styles.title}>No Internet Connection</Text>
        <Text style={styles.subtitle}>
          Check your connection and try again
        </Text>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Quick fixes:</Text>
          <Text style={styles.tip}>• Check your Wi-Fi or mobile data</Text>
          <Text style={styles.tip}>• Toggle airplane mode on and off</Text>
          <Text style={styles.tip}>• Move to an area with better signal</Text>
        </View>

        <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.screenPadding * 2,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: SIZES.xxl,
  },
  icon: {
    fontSize: 80,
  },
  xMark: {
    position: 'absolute',
    bottom: -4,
    right: -8,
    backgroundColor: COLORS.danger,
    borderRadius: 16,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  xMarkText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SIZES.xxl,
  },
  tipsContainer: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.base,
    marginBottom: SIZES.xxl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  tip: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    alignSelf: 'stretch',
    height: 52,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
