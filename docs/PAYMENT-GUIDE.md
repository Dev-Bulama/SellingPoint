# Paystack Payment Integration Guide

This guide explains everything you need to know about accepting payments in Sellingpoint using Paystack.

---

## What Is Paystack?

Paystack is a payment gateway that lets your app accept card payments, bank transfers, and other payment methods. It is trusted by thousands of businesses in Nigeria, Ghana, Kenya, South Africa, and Egypt.

Sellingpoint integrates with Paystack in two ways:
1. The **backend** initializes payments and verifies them via the Paystack API
2. The **mobile app** opens a Paystack checkout WebView where customers complete their payment

---

## Test vs Live Environments

Paystack has two environments — test and live. Understanding when to use each is important.

| Aspect | Test Environment | Live Environment |
|--------|-----------------|-----------------|
| Key prefix | `sk_test_` / `pk_test_` | `sk_live_` / `pk_live_` |
| Real money | No | Yes |
| Test cards | Works | Does not work |
| Real cards | Does not work | Works |
| When to use | Development and staging | Production only |
| Verification needed | No | Yes (KYC required) |

Always use test keys during development. Never put live keys in a development environment where they might be logged or exposed.

---

## Step 1: Create a Paystack Account

1. Go to https://paystack.com
2. Click **Create a free account**
3. Fill in your name, email, and password
4. Verify your email address
5. Complete the onboarding (you can skip the business verification for now — test keys work immediately)

---

## Step 2: Get Your API Keys

1. Log in to your Paystack dashboard at https://dashboard.paystack.com
2. Click the **Settings** icon in the left sidebar
3. Click **API Keys & Webhooks**
4. You will see two sets of keys:
   - **Test Secret Key** (starts with `sk_test_`)
   - **Test Public Key** (starts with `pk_test_`)
   - **Live Secret Key** (starts with `sk_live_`) — available after verification
   - **Live Public Key** (starts with `pk_live_`)
5. Copy the **Test Secret Key** and **Test Public Key**

---

## Step 3: Add Keys to Backend

Open `sellingpoint/backend/.env` and update:

```env
PAYSTACK_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY_HERE
PAYSTACK_PUBLIC_KEY=pk_test_YOUR_TEST_PUBLIC_KEY_HERE
```

You can also configure keys from the admin panel: **Configuration → Settings → Paystack tab**.

Restart the backend after changing `.env`:
```bash
php artisan config:clear
php artisan serve
```

---

## Payment Flow (How It Works)

Here is the complete flow from the customer tapping "Checkout" to the order being marked as paid:

```
1. Customer reviews cart and taps "Place Order"
      |
      v
2. App calls: POST /api/v1/orders/checkout
   Backend creates the order with status: pending, payment: unpaid
      |
      v
3. App calls: POST /api/v1/payments/initialize
   Backend calls Paystack API to create a payment transaction
   Paystack returns: { authorization_url, reference }
      |
      v
4. App opens the authorization_url in a WebView
   Customer enters card details on Paystack's secure page
      |
      v
5. Customer completes payment on Paystack
   WebView redirects to a callback URL
      |
      v
6. App calls: POST /api/v1/payments/verify
   Backend calls Paystack to confirm the payment is genuine
   If verified: order status → "processing", payment status → "paid"
      |
      v
7. Simultaneously, Paystack sends a webhook to:
   POST /api/v1/payments/webhook
   Backend uses this as a backup verification (handles network failures)
      |
      v
8. Customer sees "Order Confirmed" screen
   Admin dashboard shows the new paid order
```

---

## Test Card Numbers

Use these card numbers when testing payments. These are official Paystack test cards — no real money is charged.

### Cards That Succeed

| Card Number | Expiry | CVV | PIN | Description |
|------------|--------|-----|-----|-------------|
| 4084 0840 8408 4081 | 01/25 | 408 | 0000 | Standard success |
| 5531 8866 5214 2950 | 09/32 | 564 | 3310 | MasterCard success |
| 4000 0000 0000 0002 | 01/99 | 408 | — | Visa success (no PIN) |
| 5061 0600 0000 0000 007 | 01/99 | — | 1234 | Verve success |
| 4084 0800 0000 0409 | 01/99 | 000 | 0000 | 3D Secure test |

### Cards That Fail

| Card Number | Expiry | CVV | What Happens |
|------------|--------|-----|-------------|
| 4084 0840 8408 4085 | 01/99 | 408 | Declined (insufficient funds) |
| 4242 4242 4242 4243 | 01/99 | 123 | Card declined |

### Test Bank Transfer

To test bank transfer payments:
1. Select "Pay with Bank Transfer" in the Paystack checkout
2. Paystack provides a test bank account number
3. Use **Wema Bank** as the test bank
4. "Transfer" the exact amount shown

---

## Setting Up Webhooks

Webhooks ensure your backend is notified of payment events even if the customer closes the app before the verify step completes. They are essential for production.

### Register Your Webhook URL

1. Log in to https://dashboard.paystack.com
2. Go to **Settings → API Keys & Webhooks**
3. Scroll to the **Webhooks** section
4. In the **Webhook URL** field, enter:
   ```
   https://yourdomain.com/api/v1/payments/webhook
   ```
   (Use your actual production domain — not localhost)
5. Click **Update**

For development testing with localhost, use a tool like ngrok to expose your local server:
```bash
# Install ngrok from https://ngrok.com
ngrok http 8000
# Copy the https URL it gives you (e.g. https://abc123.ngrok.io)
# Use: https://abc123.ngrok.io/api/v1/payments/webhook
```

### How Webhook Verification Works

When Paystack sends a webhook, it includes a signature header:
```
X-Paystack-Signature: hmac-sha512-hash
```

The backend verifies this signature to confirm the request actually came from Paystack (not a fake request from a malicious actor):

```php
$signature = hash_hmac('sha512', $payload, config('services.paystack.secret_key'));
if ($signature !== $request->header('X-Paystack-Signature')) {
    return response()->json(['error' => 'Invalid signature'], 403);
}
```

Never process a webhook request without verifying the signature.

---

## Manually Verifying a Transaction

If you need to check whether a payment succeeded (for debugging), you can call Paystack's API directly:

```bash
curl https://api.paystack.co/transaction/verify/REFERENCE_HERE \
  -H "Authorization: Bearer sk_test_your_secret_key_here"
```

Replace `REFERENCE_HERE` with the transaction reference (e.g., `SP1234567890_1705315800`).

**Success response:**
```json
{
  "status": true,
  "message": "Verification successful",
  "data": {
    "status": "success",
    "reference": "SP1234567890_1705315800",
    "amount": 42000000,
    "currency": "NGN",
    "paid_at": "2025-01-15T10:32:00.000Z",
    "customer": {
      "email": "john@example.com"
    }
  }
}
```

Note: `amount` is in kobo (Nigerian cents). Divide by 100 to get naira. 42000000 kobo = ₦420,000.

---

## Going Live (Production)

When you are ready to accept real payments:

1. Complete KYC (business verification) in Paystack dashboard:
   - Business name and type
   - Bank account for settlements
   - Identity verification
   - Business documents

2. After approval, Paystack activates your live keys

3. Update your production `.env`:
   ```env
   PAYSTACK_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
   PAYSTACK_PUBLIC_KEY=pk_live_YOUR_LIVE_PUBLIC_KEY_HERE
   ```

4. Update the webhook URL in Paystack dashboard to your production URL

5. Test with a real card making a small payment (₦100) and confirm it settles

---

## Common Errors and Solutions

### "Invalid key" or "Authorization error"
The API key in your `.env` is wrong. Copy the key again directly from the Paystack dashboard — watch for accidental spaces or truncation.

### "Transaction reference already used"
Each payment initialization generates a unique reference. You cannot reuse references. The backend generates a new reference each time `POST /payments/initialize` is called.

### Webhook not firing
- Make sure your webhook URL is publicly accessible (not localhost)
- Check that the URL is saved correctly in the Paystack dashboard
- Test webhooks manually from the Paystack dashboard: **Settings → API Keys & Webhooks → Test Webhooks**
- Check your server logs for incoming requests

### "Insufficient funds" on test card
You are using a card number that is supposed to fail. Use card `4084084084084081` for a successful test transaction.

### Payment initialized but verification fails
Check that the reference you are verifying matches exactly what was returned during initialization. References are case-sensitive.

### Orders not updating after webhook
The queue worker may not be running. Start it:
```bash
php artisan queue:work
```
Check `storage/logs/laravel.log` for any errors.

### "Could not connect to Paystack" / cURL error
The backend server cannot reach Paystack's API. Check:
- Internet connection from the server
- `PAYSTACK_SECRET_KEY` is set correctly
- PHP has the `curl` extension enabled: `php -m | grep curl`

---

## Currency Note

Paystack processes payments in kobo (for NGN), pesewas (for GHS), and cents for other currencies. The amount field in all API calls is in the smallest currency unit:

| Currency | Unit | Example |
|---------|------|---------|
| NGN (Naira) | Kobo | ₦15,000 = 1500000 kobo |
| GHS (Cedi) | Pesewa | GH₵150 = 15000 pesewas |
| USD (Dollar) | Cent | $150 = 15000 cents |
| KES (Shilling) | Cent | KES 150 = 15000 cents |

The Sellingpoint backend handles this conversion automatically before calling the Paystack API.
