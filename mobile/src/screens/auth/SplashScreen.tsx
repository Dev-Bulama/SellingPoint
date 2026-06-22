import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { COLORS } from '../../constants';

interface Props {
  appName?: string;
  appLogo?: string;
}

export default function SplashScreen({ appName, appLogo }: Props) {
  const name = appName || 'Sellingpoint';
  const tagline = 'Shop Everything, Everywhere';

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {appLogo ? (
          <Image source={{ uri: appLogo }} style={styles.logoImage} resizeMode="contain" />
        ) : (
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>{name.slice(0, 2).toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.brandName}>{name}</Text>
        <Text style={styles.tagline}>{tagline}</Text>
      </View>
      <ActivityIndicator size="large" color={COLORS.white} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: { alignItems: 'center' },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 24,
    marginBottom: 16,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 8,
  },
  logoText: { fontSize: 36, fontWeight: 'bold', color: COLORS.primary },
  brandName: { fontSize: 32, fontWeight: 'bold', color: COLORS.white, letterSpacing: 1 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  loader: { position: 'absolute', bottom: 80 },
});
