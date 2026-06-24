/**
 * BOOTSTRAP URL — used ONLY for the very first settings fetch on app startup.
 *
 * After that first call, the admin panel (Settings → Environment) controls
 * which URL the app uses. You only need to update PRODUCTION_API_URL here
 * once when going live. Everything else is managed from the admin panel.
 *
 * LOCAL DEVELOPMENT — EMULATOR
 *   LOCAL_API_URL = 'http://10.0.2.2:8000/api/v1'
 *
 * LOCAL DEVELOPMENT — PHYSICAL DEVICE (via Phone Hotspot)
 *   1. Turn on your phone's Personal Hotspot
 *   2. Connect your PC to the phone hotspot
 *   3. Run: ipconfig  →  find the new IPv4 (usually 192.168.43.x or 192.168.137.x)
 *   4. Set LOCAL_API_URL = 'http://192.168.43.xxx:8000/api/v1'
 *   5. php artisan serve --host=0.0.0.0 --port=8000
 *   NOTE: Corporate/university WiFi blocks device-to-device traffic — always use hotspot.
 *
 * GOING TO PRODUCTION
 *   1. Set PRODUCTION_API_URL to your live domain below
 *   2. In Admin → Settings → Environment, set Production API URL to the same value
 *   3. Set Active Environment = Production (or enable Force Production)
 *   4. Rebuild the app — done. No further code changes needed for future URL changes.
 */

// ─── Set your URLs here ───────────────────────────────────────────────────────
const LOCAL_API_URL      = 'http://10.0.2.2:8000/api/v1'; // ← replace with your hotspot IP when testing on a physical device
const PRODUCTION_API_URL = 'https://sellingpointshop.com/api/v1';
// ─────────────────────────────────────────────────────────────────────────────

export const API_BASE_URL: string = __DEV__ ? LOCAL_API_URL : PRODUCTION_API_URL;

export const LOCAL_API_BASE_URL      = LOCAL_API_URL;
export const PRODUCTION_API_BASE_URL = PRODUCTION_API_URL;

export const API_TIMEOUT = 30000;
export const APP_VERSION = '1.0.0';
