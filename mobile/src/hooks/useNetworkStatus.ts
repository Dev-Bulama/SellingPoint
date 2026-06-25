import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { API_BASE_URL } from '../config/api';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);

  const checkConnection = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      // Ping the app's own backend — if it's reachable, the app can function
      await fetch(`${API_BASE_URL}/ping`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      setIsConnected(true);
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
