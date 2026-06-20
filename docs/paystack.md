# Paystack Integration Guide

## Setup

1. Create a Paystack account at [paystack.com](https://paystack.com)
2. Get your API keys from the **Settings → API Keys & Webhooks** page
3. Add to `.env`:

```env
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
```

## Payment Flow

```
Mobile App                    Backend                      Paystack
    |                            |                              |
    |-- POST /orders/checkout -->|                              |
    |<-- { order_number } -------|                              |
    |                            |                              |
    |-- POST /payments/initialize|                              |
    |                            |-- POST /transaction/initialize -->
    |                            |<-- { authorization_url, reference }
    |<-- { reference, url } -----|                              |
    |                            |                              |
    | [User pays via Paystack SDK or WebView]                   |
    |                            |                              |
    |-- POST /payments/verify ---|                              |
    |                            |-- GET /transaction/verify/{ref} -->
    |                            |<-- { status: "success" } ---|
    |                            |                              |
    |<-- { message: "Payment verified" }                        |
    |                            |                              |
    |                            |<-- Webhook: charge.success--|
    |                            | (backup verification)       |
```

## Webhook Setup

1. In Paystack Dashboard → **Settings → API Keys & Webhooks**
2. Set webhook URL: `https://yourdomain.com/api/v1/payments/webhook`
3. Paystack sends `X-Paystack-Signature` header with each request

The backend verifies it using:
```php
hash_hmac('sha512', $payload, config('services.paystack.secret_key'))
```

## Supported Events

| Event | Action |
|-------|--------|
| `charge.success` | Marks order as paid, triggers fulfillment |

## Testing

Use Paystack test cards:

| Card Number | CVV | Expiry | Result |
|-------------|-----|--------|--------|
| 4084084084084081 | 408 | 01/99 | Success |
| 4084080000000409 | 000 | 01/99 | Decline |

Test bank transfer: use **Wema Bank** test account.

## Mobile SDK

For production, integrate [react-native-paystack-webview](https://github.com/just1and0/react-native-paystack-webview):

```bash
npm install react-native-paystack-webview
```

```typescript
import PaystackWebView from 'react-native-paystack-webview';

<PaystackWebView
  paystackKey={PAYSTACK_PUBLIC_KEY}
  amount={order.total * 100}  // Paystack uses kobo (multiply by 100)
  billingEmail={user.email}
  activityIndicatorColor={COLORS.primary}
  onCancel={() => {}}
  onSuccess={(res) => verifyPayment(res.transactionRef.reference)}
  autoStart
/>
```
