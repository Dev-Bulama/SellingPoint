import React, { useEffect, useState } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaystackProvider } from 'react-native-paystack-webview';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants';
import { cmsApi } from './src/api/cms';

export default function App() {
  const [paystackKey, setPaystackKey] = useState('pk_placeholder');

  useEffect(() => {
    cmsApi.settings()
      .then(r => {
        const key = r.data.data?.paystack_public_key;
        if (key) setPaystackKey(key);
      })
      .catch(() => {});
  }, []);

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
