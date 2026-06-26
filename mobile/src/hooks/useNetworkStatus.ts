import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { API_BASE_URL } from '../config/api';

export type NetworkState = 'good' | 'slow' | 'offline';

export function useNetworkStatus() {
  const [networkState, setNetworkState] = useState<NetworkState>('good');

  const checkConnection = async () => {
    // Fast check: 5 seconds — good connection
    try {
      const fast = new AbortController();
      const fastTimer = setTimeout(() => fast.abort(), 5000);
      await fetch(`${API_BASE_URL}/ping`, { method: 'GET', signal: fast.signal });
      clearTimeout(fastTimer);
      setNetworkState('good');
      return;
    } catch {}

    // Slow check: 20 seconds — weak signal but reachable
    try {
      const slow = new AbortController();
      const slowTimer = setTimeout(() => slow.abort(), 20000);
      await fetch(`${API_BASE_URL}/ping`, { method: 'GET', signal: slow.signal });
      clearTimeout(slowTimer);
      setNetworkState('slow');
    } catch {
      setNetworkState('offline');
    }
  };

  useEffect(() => {
    checkConnection();
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') checkConnection();
    });
    return () => subscription.remove();
  }, []);

  return {
    isConnected: networkState !== 'offline',
    isSlow: networkState === 'slow',
    networkState,
    retry: checkConnection,
  };
}
