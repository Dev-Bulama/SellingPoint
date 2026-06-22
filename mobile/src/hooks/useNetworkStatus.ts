import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { API_BASE_URL } from '../config/api';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);

  const checkConnection = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      // Ping the app's own backend — if it's reachable, the app can function
      const response = await fetch(`${API_BASE_URL}/ping`, {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      // Any HTTP response (even 404) means the server is reachable
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
