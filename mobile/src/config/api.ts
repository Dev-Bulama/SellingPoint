/**
 * API Configuration
 *
 * HOW ENVIRONMENT SWITCHING WORKS
 * ================================
 * - DEBUG builds  (__DEV__ === true):  automatically use LOCAL_API_URL
 * - RELEASE builds (__DEV__ === false): automatically use PRODUCTION_API_URL
 *
 * Override either URL below to point to a different backend.
 *
 * LOCAL DEVELOPMENT — EMULATOR
 *   LOCAL_API_URL = 'http://10.0.2.2:8000/api/v1'   ← Android emulator → host machine
 *
 * LOCAL DEVELOPMENT — PHYSICAL DEVICE
 *   1. Run: ipconfig (Windows) or ifconfig (Mac/Linux)
 *   2. Find your WiFi IPv4 address, e.g. 192.168.1.105
 *   3. Change LOCAL_API_URL to: 'http://192.168.1.105:8000/api/v1'
 *   4. Start Laravel: php artisan serve --host=0.0.0.0 --port=8000
 *   5. Phone and PC must be on the same WiFi network
 *
 * PRODUCTION
 *   PRODUCTION_API_URL is used automatically for release builds.
 *   Admin can also toggle this from the Filament admin panel → Settings → Environment.
 */

// ─── Change these URLs to match your backend ──────────────────────────────────
const LOCAL_API_URL      = 'http://10.153.6.102:8000/api/v1';
const PRODUCTION_API_URL = 'https://sellingpoint.ng/api/v1';
// ──────────────────────────────────────────────────────────────────────────────

export const API_BASE_URL: string = __DEV__ ? LOCAL_API_URL : PRODUCTION_API_URL;

export const LOCAL_API_BASE_URL      = LOCAL_API_URL;
export const PRODUCTION_API_BASE_URL = PRODUCTION_API_URL;

export const API_TIMEOUT = 30000; // 30 seconds

export const APP_VERSION = '1.0.0';

/**
 * Returns the correct API base URL for the current build type.
 * Use this instead of API_BASE_URL if you need to call it as a function.
 */
export function getApiUrl(): string {
  return __DEV__ ? LOCAL_API_URL : PRODUCTION_API_URL;
}
