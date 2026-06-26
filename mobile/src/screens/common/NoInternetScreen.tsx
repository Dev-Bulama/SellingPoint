import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../../constants';

interface Props {
  onRetry: () => void;
  isSlow?: boolean;
}

export default function NoInternetScreen({ onRetry, isSlow = false }: Props) {
  if (isSlow) {
    return (
      <View style={styles.slowBanner}>
        <IonIcon name="wifi-outline" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
        <Text style={styles.slowText}>Weak signal — some content may load slowly</Text>
        <TouchableOpacity onPress={onRetry} style={styles.slowRetry}>
          <Text style={styles.slowRetryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <IonIcon name="cloud-offline-outline" size={80} color={COLORS.border} />
          <View style={styles.xMark}>
            <IonIcon name="close" size={14} color={COLORS.white} />
          </View>
        </View>

        <Text style={styles.title}>No Internet Connection</Text>
        <Text style={styles.subtitle}>
          It looks like you're offline. Please check your connection and try again.
        </Text>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Quick fixes:</Text>
          <Text style={styles.tip}>• Turn your mobile data or Wi-Fi on</Text>
          <Text style={styles.tip}>• Toggle airplane mode off</Text>
          <Text style={styles.tip}>• Move to an area with better signal</Text>
          <Text style={styles.tip}>• Restart your router if on Wi-Fi</Text>
        </View>

        <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.8}>
          <IonIcon name="refresh-outline" size={18} color={COLORS.white} style={{ marginRight: 8 }} />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ── Slow network banner (non-blocking) ──────────────────────────────────────
  slowBanner: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    backgroundColor: '#E67E22',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 44, // account for status bar
    zIndex: 999,
  },
  slowText: { flex: 1, color: COLORS.white, fontSize: 13, fontWeight: '500' },
  slowRetry: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 6 },
  slowRetryText: { color: COLORS.white, fontSize: 13, fontWeight: 'bold' },

  // ── Full offline screen ──────────────────────────────────────────────────────
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SIZES.screenPadding * 2 },
  iconContainer: { position: 'relative', marginBottom: SIZES.xxl },
  xMark: {
    position: 'absolute', bottom: -4, right: -8,
    backgroundColor: COLORS.danger, borderRadius: 16,
    width: 28, height: 28, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.white,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: SIZES.sm },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: SIZES.xxl },
  tipsContainer: {
    alignSelf: 'stretch', backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius, padding: SIZES.base,
    marginBottom: SIZES.xxl, borderWidth: 1, borderColor: COLORS.border,
  },
  tipsTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SIZES.xs },
  tip: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 22 },
  retryButton: {
    backgroundColor: COLORS.primary, alignSelf: 'stretch', height: 52,
    borderRadius: SIZES.borderRadius, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    elevation: 2, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3,
  },
  retryButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});
