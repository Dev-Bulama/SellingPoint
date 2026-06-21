import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import NoInternetScreen from '../screens/common/NoInternetScreen';
import ForceUpdateScreen from '../screens/common/ForceUpdateScreen';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, loadUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);
  const { isConnected, retry } = useNetworkStatus();

  useEffect(() => {
    const init = async () => {
      await loadUser();
      setIsLoading(false);
    };
    init();
  }, []);

  if (isLoading) return <SplashScreen />;

  return (
    <View style={styles.root}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!hasSeenOnboarding ? (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          ) : isAuthenticated ? (
            <Stack.Screen name="Main" component={MainNavigator} />
          ) : (
            <Stack.Screen name="Auth" component={AuthNavigator} />
          )}
          <Stack.Screen
            name="ForceUpdate"
            component={ForceUpdateScreen}
            options={{
              gestureEnabled: false,
              headerBackVisible: false,
            }}
          />
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
