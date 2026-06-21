import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, AppState } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import NoInternetScreen from '../screens/common/NoInternetScreen';
import ForceUpdateScreen from '../screens/common/ForceUpdateScreen';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import apiClient from '../api/client';

const APP_VERSION = '1.0.0';
const ONBOARDING_KEY = 'has_seen_onboarding';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, loadUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);
  const [forceUpdate, setForceUpdate] = useState<{ required: boolean; minVersion: string } | null>(null);
  const { isConnected, retry } = useNetworkStatus();
  const navRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    const init = async () => {
      const [seen] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_KEY),
        loadUser(),
      ]);
      setHasSeenOnboarding(seen === 'true');
      setIsLoading(false);
    };
    init();
  }, []);

  // Check settings for maintenance mode and force update
  useEffect(() => {
    const checkSettings = async () => {
      try {
        const res = await apiClient.get('/cms/settings');
        const s = res.data.data;
        const min = s.min_app_version ?? '1.0.0';
        if (compareVersions(APP_VERSION, min) < 0) {
          setForceUpdate({ required: true, minVersion: min });
        }
      } catch {
        // non-fatal — skip if settings unavailable
      }
    };
    checkSettings();
  }, []);

  if (isLoading) return <SplashScreen />;

  return (
    <View style={styles.root}>
      <NavigationContainer ref={navRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {forceUpdate?.required ? (
            <Stack.Screen
              name="ForceUpdate"
              component={ForceUpdateScreen}
              initialParams={{ currentVersion: APP_VERSION, requiredVersion: forceUpdate.minVersion }}
              options={{ gestureEnabled: false, headerBackVisible: false }}
            />
          ) : !hasSeenOnboarding ? (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          ) : isAuthenticated ? (
            <Stack.Screen name="Main" component={MainNavigator} />
          ) : (
            <Stack.Screen name="Auth" component={AuthNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {/* Full-screen offline overlay — rendered outside NavigationContainer so it
          covers everything, including any modals from nested navigators. */}
      {!isConnected && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <NoInternetScreen onRetry={retry} />
        </View>
      )}
    </View>
  );
}

/** Compares semver strings. Returns negative if a < b, 0 if equal, positive if a > b. */
function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
