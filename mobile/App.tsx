import React, { useEffect, useState } from 'react';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaystackProvider } from 'react-native-paystack-webview';
import AppNavigator from './src/navigation/AppNavigator';
import MaintenanceScreen from './src/screens/common/MaintenanceScreen';
import { COLORS } from './src/constants';
import { cmsApi } from './src/api/cms';

export default function App() {
  const [paystackKey, setPaystackKey] = useState<string | null>(null);
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    cmsApi.settings()
      .then(r => {
        const d = r.data.data ?? {};
        setPaystackKey(d.paystack_public_key || 'pk_test_placeholder');
        setMaintenance(!!d.maintenance_mode);
      })
      .catch(() => {
        setPaystackKey('pk_test_placeholder');
      });
  }, []);

  // Show a minimal spinner while fetching settings (< 1s on LAN)
  if (paystackKey === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary }}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    );
  }

  if (maintenance) {
    return (
      <SafeAreaProvider>
        <MaintenanceScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <PaystackProvider publicKey={paystackKey}>
          <AppNavigator />
        </PaystackProvider>
      </SafeAreaProvider>
    </View>
  );
}
