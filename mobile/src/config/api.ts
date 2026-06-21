/**
 * API Configuration
 *
 * FOR LOCAL DEVELOPMENT WITH PHYSICAL DEVICE:
 *   1. Run: ipconfig (Windows) or ifconfig (Mac/Linux)
 *   2. Find your WiFi IPv4 address (e.g. 192.168.1.105)
 *   3. Set: API_BASE_URL = 'http://192.168.1.105:8000/api/v1'
 *   4. Start Laravel: php artisan serve --host=0.0.0.0 --port=8000
 *   5. Phone and PC must be on the same WiFi network
 *
 * FOR EMULATOR:
 *   API_BASE_URL = 'http://10.0.2.2:8000/api/v1'
 *
 * FOR PRODUCTION:
 *   API_BASE_URL = 'https://api.yourdomain.com/api/v1'
 */

// ─── CHANGE THIS TO YOUR ACTUAL BACKEND URL ───────────────────────────────
export const API_BASE_URL = 'http://10.0.2.2:8000/api/v1';
// ──────────────────────────────────────────────────────────────────────────

export const API_TIMEOUT = 30000; // 30 seconds

export const APP_VERSION = '1.0.0';
