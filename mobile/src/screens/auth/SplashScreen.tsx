import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { COLORS } from '../../constants';
import apiClient from '../../api/client';

interface SplashSettings {
  app_name?: string;
  app_logo?: string;
  app_tagline?: string;
}

export default function SplashScreen() {
  const [settings, setSettings] = useState<SplashSettings>({});

  useEffect(() => {
    apiClient.get('/cms/settings')
      .then(res => {
        const s = res.data.data ?? {};
        setSettings({
          app_name: s.app_name,
          app_logo: s.app_logo,
          app_tagline: s.app_tagline,
        });
      })
      .catch(() => {});
  }, []);

  const appName = settings.app_name || 'Sellingpoint';
  const tagline = settings.app_tagline || 'Shop Everything, Everywhere';

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {settings.app_logo ? (
          <Image source={{ uri: settings.app_logo }} style={styles.logoImage} resizeMode="contain" />
        ) : (
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>{appName.slice(0, 2).toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.brandName}>{appName}</Text>
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
