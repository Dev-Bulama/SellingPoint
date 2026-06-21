import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);

  const checkConnection = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      setIsConnected(response.ok);
    } catch {
      setIsConnected(false);
    }
  };

  useEffect(() => {
    checkConnection();

    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        checkConnection();
      }
    });

    return () => subscription.remove();
  }, []);

  return { isConnected, retry: checkConnection };
}
