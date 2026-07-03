// HMAC-SHA256 request signing using the Web Crypto API (available in Hermes / RN 0.71+)
// The secret never travels over the wire — only the timestamp + signature are sent as query params.
// Server rejects requests with timestamps older than 5 minutes, preventing replay attacks.

const APP_API_SECRET = 'REPLACE_WITH_YOUR_APP_API_SECRET';

async function hmacSha256(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  return Array.from(new Uint8Array(sigBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Returns `{ _t, _s }` query params to attach to every request.
 * message = TIMESTAMP:METHOD:PATH  (mirrors the PHP middleware exactly)
 */
export async function signRequest(method: string, path: string): Promise<{ _t: string; _s: string }> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  // Normalise path — strip leading slash, remove query string
  const cleanPath = path.replace(/\?.*$/, '').replace(/^\//, '');
  const message = `${timestamp}:${method.toUpperCase()}:${cleanPath}`;
  const signature = await hmacSha256(APP_API_SECRET, message);
  return { _t: timestamp, _s: signature };
}
