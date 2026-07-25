import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import { signRequest } from '../utils/requestSigning';

// In-memory token cache — avoids AsyncStorage lookup on every request
let cachedToken: string | null | undefined = undefined;

export async function setAuthToken(token: string | null) {
  cachedToken = token;
  if (token) {
    await AsyncStorage.setItem('auth_token', token);
  } else {
    await AsyncStorage.removeItem('auth_token');
  }
}

async function getToken(): Promise<string | null> {
  if (cachedToken !== undefined) return cachedToken;
  cachedToken = await AsyncStorage.getItem('auth_token');
  return cachedToken;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Retry safe read-only requests on network failure / 5xx (not on 4xx or write ops)
const RETRY_METHODS = new Set(['get', 'head']);
const MAX_RETRIES = 2;

function isRetryable(error: AxiosError): boolean {
  if (!RETRY_METHODS.has((error.config?.method ?? '').toLowerCase())) return false;
  if (!error.response) return true; // network error
  return error.response.status >= 500 && error.response.status !== 501;
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// Called once on app startup after admin settings are fetched.
// Switches all subsequent API calls to the admin-configured URL.
export function setBaseUrl(url: string) {
  if (url && url !== apiClient.defaults.baseURL) {
    apiClient.defaults.baseURL = url;
  }
}

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Auth token
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // HMAC request signature — skip ping (no signing required)
    const path = config.url ?? '';
    if (!path.includes('/ping')) {
      const method = config.method ?? 'get';
      // Resolve full path relative to baseURL for signing
      const base = (config.baseURL ?? apiClient.defaults.baseURL ?? '').replace(/\/$/, '');
      const fullPath = base + (path.startsWith('/') ? path : '/' + path);
      // Extract just the path portion (strip domain)
      const urlPath = fullPath.replace(/^https?:\/\/[^/]+/, '');
      const { _t, _s } = await signRequest(method, urlPath);
      config.params = { ...(config.params ?? {}), _t, _s };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

    if (error.response?.status === 401) {
      cachedToken = null;
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user');
      return Promise.reject(error);
    }

    // Retry with exponential backoff
    if (isRetryable(error) && config) {
      config._retryCount = (config._retryCount ?? 0) + 1;
      if (config._retryCount <= MAX_RETRIES) {
        await sleep(500 * Math.pow(2, config._retryCount - 1)); // 500ms, 1000ms
        return apiClient(config);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
