# API Documentation

Complete reference for the Sellingpoint REST API.

**Base URL (development):** `http://localhost:8000/api/v1`
**Base URL (production):** `https://api.yourdomain.com/api/v1`

---

## Authentication

The API uses **Laravel Sanctum** token-based authentication.

After logging in, you receive a Bearer token. Include it in every authenticated request:

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
Accept: application/json
```

The `Accept: application/json` header is required — without it, Laravel returns an HTML redirect instead of JSON for auth errors.

---

## Authentication Endpoints

### Register a New Customer

```
POST /api/v1/auth/register
```

**Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+2348012345678",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**cURL example:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+2348012345678",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

**Success response (201 Created):**
```json
{
  "message": "Registration successful",
  "token": "1|abc123xyz...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+2348012345678",
    "created_at": "2025-01-15T10:30:00.000000Z"
  }
}
```

**Error response (422 Unprocessable Entity):**
```json
{
  "message": "The email has already been taken.",
  "errors": {
    "email": ["The email has already been taken."]
  }
}
```

---

### Login

```
POST /api/v1/auth/login
```

**Request body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**cURL example:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'
```

**Success response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "2|xyz456abc...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+2348012345678"
  }
}
```

**Error response (401 Unauthorized):**
```json
{
  "message": "Invalid credentials"
}
```

---

### Logout *(requires auth)*

```
POST /api/v1/auth/logout
```

**cURL example:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Success response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

### Get Profile *(requires auth)*

```
GET /api/v1/auth/profile
```

**cURL example:**
```bash
curl http://localhost:8000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Success response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+2348012345678",
    "gender": "male",
    "date_of_birth": "1990-05-15",
    "avatar": "http://localhost:8000/storage/avatars/1.jpg"
  }
}
```

---

### Update Profile *(requires auth)*

```
POST /api/v1/auth/profile
Content-Type: multipart/form-data
```

**Fields:** `name`, `phone`, `gender`, `date_of_birth`, `avatar` (file upload)

**cURL example:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json" \
  -F "name=John Updated" \
  -F "phone=+2348099999999" \
  -F "avatar=@/path/to/photo.jpg"
```

---

### Change Password *(requires auth)*

```
POST /api/v1/auth/change-password
```

**Request body:**
```json
{
  "current_password": "oldpassword123",
  "password": "newpassword456",
  "password_confirmation": "newpassword456"
}
```

---

### Forgot Password

```
POST /api/v1/auth/forgot-password
```

**Request body:**
```json
{
  "email": "john@example.com"
}
```

**Success response (200 OK):**
```json
{
  "message": "Password reset OTP sent to your email"
}
```

---

### Reset Password

```
POST /api/v1/auth/reset-password
```

**Request body:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "password": "newpassword456",
  "password_confirmation": "newpassword456"
}
```

---

## Product Endpoints (Public — No Auth Required)

### List Products

```
GET /api/v1/products
```

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `per_page` | integer | Items per page (default: 15) |
| `category` | string | Filter by category slug |
| `brand` | string | Filter by brand slug |
| `search` | string | Search by product name |
| `sort` | string | Sort order: `latest`, `price_asc`, `price_desc`, `popular`, `rating` |
| `min_price` | integer | Minimum price filter |
| `max_price` | integer | Maximum price filter |

**cURL example:**
```bash
curl "http://localhost:8000/api/v1/products?category=electronics&sort=price_asc&per_page=10" \
  -H "Accept: application/json"
```

**Success response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Samsung Galaxy S24",
      "slug": "samsung-galaxy-s24",
      "price": 450000,
      "discount_price": 420000,
      "main_image": "http://localhost:8000/storage/products/s24.jpg",
      "category": { "id": 1, "name": "Electronics" },
      "brand": { "id": 3, "name": "Samsung" },
      "average_rating": 4.5,
      "review_count": 12,
      "in_stock": true
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 10,
    "total": 48
  }
}
```

---

### Get Product Detail

```
GET /api/v1/products/{slug}
```

**cURL example:**
```bash
curl http://localhost:8000/api/v1/products/samsung-galaxy-s24 \
  -H "Accept: application/json"
```

**Success response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "name": "Samsung Galaxy S24",
    "slug": "samsung-galaxy-s24",
    "description": "Full product description here...",
    "price": 450000,
    "discount_price": 420000,
    "images": [
      "http://localhost:8000/storage/products/s24-1.jpg",
      "http://localhost:8000/storage/products/s24-2.jpg"
    ],
    "variants": [
      {
        "id": 1,
        "name": "Color",
        "options": [
          { "id": 1, "value": "Phantom Black", "price": null, "stock": 10 },
          { "id": 2, "value": "Marble Grey", "price": null, "stock": 5 }
        ]
      }
    ],
    "stock": 15,
    "category": { "id": 1, "name": "Electronics", "slug": "electronics" },
    "brand": { "id": 3, "name": "Samsung" },
    "average_rating": 4.5,
    "review_count": 12
  }
}
```

---

### Featured Products

```
GET /api/v1/products/featured
```

### New Arrivals

```
GET /api/v1/products/new-arrivals
```

### Best Sellers

```
GET /api/v1/products/best-sellers
```

### Flash Sales

```
GET /api/v1/products/flash-sales
```

### Related Products

```
GET /api/v1/products/{slug}/related
```

### Product Reviews

```
GET /api/v1/products/{slug}/reviews
```

### List Categories

```
GET /api/v1/categories
```

**cURL example:**
```bash
curl http://localhost:8000/api/v1/categories \
  -H "Accept: application/json"
```

**Success response:**
```json
{
  "data": [
    { "id": 1, "name": "Electronics", "slug": "electronics", "icon": "📱", "product_count": 48 },
    { "id": 2, "name": "Fashion", "slug": "fashion", "icon": "👗", "product_count": 120 }
  ]
}
```

### List Brands

```
GET /api/v1/brands
```

---

## Cart Endpoints *(requires auth)*

### Get Cart

```
GET /api/v1/cart
```

**cURL example:**
```bash
curl http://localhost:8000/api/v1/cart \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Success response:**
```json
{
  "data": {
    "items": [
      {
        "id": 5,
        "product": { "id": 1, "name": "Samsung Galaxy S24", "slug": "samsung-galaxy-s24" },
        "variant": { "id": 1, "value": "Phantom Black" },
        "quantity": 2,
        "unit_price": 420000,
        "total_price": 840000
      }
    ],
    "subtotal": 840000,
    "item_count": 2
  }
}
```

---

### Add Item to Cart

```
POST /api/v1/cart/add
```

**Request body:**
```json
{
  "product_id": 1,
  "variant_id": 1,
  "quantity": 2
}
```

`variant_id` is optional — only include if the product has variants and the customer selected one.

**cURL example:**
```bash
curl -X POST http://localhost:8000/api/v1/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"product_id": 1, "variant_id": 1, "quantity": 2}'
```

---

### Update Cart Item Quantity

```
PUT /api/v1/cart/items/{id}
```

**Request body:**
```json
{
  "quantity": 3
}
```

---

### Remove Cart Item

```
DELETE /api/v1/cart/items/{id}
```

---

### Clear Cart

```
DELETE /api/v1/cart/clear
```

---

## Wishlist Endpoints *(requires auth)*

### Get Wishlist

```
GET /api/v1/wishlist
```

### Toggle Product (Add/Remove)

```
POST /api/v1/wishlist/toggle
```

**Request body:**
```json
{
  "product_id": 1
}
```

**Response:**
```json
{
  "wishlisted": true,
  "message": "Added to wishlist"
}
```
Call again to remove:
```json
{
  "wishlisted": false,
  "message": "Removed from wishlist"
}
```

### Check if Product Is Wishlisted

```
GET /api/v1/wishlist/check/{productId}
```

**Response:**
```json
{
  "wishlisted": true
}
```

---

## Address Endpoints *(requires auth)*

### List Addresses

```
GET /api/v1/addresses
```

### Create Address

```
POST /api/v1/addresses
```

**Request body:**
```json
{
  "full_name": "John Doe",
  "phone": "+2348012345678",
  "address_line1": "12 Main Street",
  "address_line2": "Flat 3B",
  "city": "Lagos",
  "state": "Lagos State",
  "country": "Nigeria",
  "postal_code": "100001",
  "is_default": true
}
```

### Update Address

```
PUT /api/v1/addresses/{id}
```

Same fields as Create.

### Delete Address

```
DELETE /api/v1/addresses/{id}
```

### Set Default Address

```
POST /api/v1/addresses/{id}/set-default
```

---

## Order Endpoints *(requires auth)*

### List Orders

```
GET /api/v1/orders
```

**cURL example:**
```bash
curl http://localhost:8000/api/v1/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "order_number": "SP1234567890",
      "status": "processing",
      "total": 840000,
      "item_count": 2,
      "created_at": "2025-01-15T10:30:00.000000Z"
    }
  ]
}
```

---

### Checkout (Place Order)

```
POST /api/v1/orders/checkout
```

**Request body:**
```json
{
  "address_id": 1,
  "payment_method": "paystack",
  "coupon_code": "WELCOME10"
}
```

`coupon_code` is optional.

**cURL example:**
```bash
curl -X POST http://localhost:8000/api/v1/orders/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"address_id": 1, "payment_method": "paystack"}'
```

**Success response (201 Created):**
```json
{
  "message": "Order placed successfully",
  "data": {
    "id": 1,
    "order_number": "SP1234567890",
    "subtotal": 840000,
    "discount": 84000,
    "shipping": 2000,
    "total": 758000,
    "status": "pending",
    "payment_status": "unpaid"
  }
}
```

---

### Validate Coupon Code

```
POST /api/v1/orders/validate-coupon
```

**Request body:**
```json
{
  "code": "WELCOME10",
  "subtotal": 840000
}
```

**Success response:**
```json
{
  "valid": true,
  "discount_amount": 84000,
  "discount_type": "percentage",
  "message": "Coupon applied: 10% off"
}
```

**Invalid coupon response:**
```json
{
  "valid": false,
  "message": "Coupon has expired"
}
```

---

### Get Order Detail

```
GET /api/v1/orders/{orderNumber}
```

Example: `GET /api/v1/orders/SP1234567890`

---

### Cancel Order

```
POST /api/v1/orders/{orderNumber}/cancel
```

Only works for orders in `pending` or `processing` status.

---

## Payment Endpoints *(requires auth)*

### Initialize Payment

Call this after checkout to get a Paystack payment link.

```
POST /api/v1/payments/initialize
```

**Request body:**
```json
{
  "order_number": "SP1234567890"
}
```

**cURL example:**
```bash
curl -X POST http://localhost:8000/api/v1/payments/initialize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"order_number": "SP1234567890"}'
```

**Success response:**
```json
{
  "authorization_url": "https://checkout.paystack.com/access_code_here",
  "access_code": "xyz123abc",
  "reference": "SP1234567890_1705315800"
}
```

Open `authorization_url` in a WebView for the customer to complete payment.

---

### Verify Payment

Call this after the customer completes payment to confirm success.

```
POST /api/v1/payments/verify
```

**Request body:**
```json
{
  "reference": "SP1234567890_1705315800"
}
```

**Success response:**
```json
{
  "message": "Payment verified successfully",
  "order": {
    "order_number": "SP1234567890",
    "status": "processing",
    "payment_status": "paid"
  }
}
```

---

### Paystack Webhook (Public — No Auth)

```
POST /api/v1/payments/webhook
```

This endpoint is called automatically by Paystack's servers when a payment event occurs. The backend verifies the `X-Paystack-Signature` header using HMAC-SHA512.

Do not call this manually. Register the URL in your Paystack dashboard:
`https://yourdomain.com/api/v1/payments/webhook`

---

## Review Endpoints *(requires auth)*

### Submit a Review

```
POST /api/v1/reviews
```

**Request body:**
```json
{
  "product_id": 1,
  "rating": 5,
  "title": "Excellent product!",
  "body": "Arrived quickly and works perfectly. Highly recommend."
}
```

`rating` must be between 1 and 5.

---

## Notification Endpoints *(requires auth)*

### List Notifications

```
GET /api/v1/notifications
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid-here",
      "type": "order_shipped",
      "title": "Order Shipped!",
      "body": "Your order SP123 is on its way.",
      "data": { "order_number": "SP123" },
      "read_at": null,
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "unread_count": 3
}
```

### Mark Notification as Read

```
POST /api/v1/notifications/{id}/read
```

### Mark All Notifications as Read

```
POST /api/v1/notifications/mark-all-read
```

### Save Push Token

Called when the app starts to register the device for push notifications.

```
POST /api/v1/notifications/push-token
```

**Request body:**
```json
{
  "token": "onesignal-player-id-here",
  "platform": "android"
}
```

---

## CMS Endpoints (Public — No Auth Required)

### Get Home Banners

```
GET /api/v1/cms/banners
```

### Get Flash Sale Info

```
GET /api/v1/cms/flash-sales
```

### Get Store Settings

```
GET /api/v1/cms/settings
```

Returns public store settings like store name, currency symbol, support phone.

**Response:**
```json
{
  "store_name": "Sellingpoint",
  "currency": "NGN",
  "currency_symbol": "₦",
  "support_phone": "+2348012345678",
  "support_email": "support@sellingpoint.com"
}
```

### Get FAQs

```
GET /api/v1/cms/faqs
```

### Get CMS Page

```
GET /api/v1/cms/pages/{slug}
```

Examples: `about-us`, `privacy-policy`, `terms-of-service`

---

## Error Responses

All error responses follow the same format:

| HTTP Code | Meaning | When It Happens |
|-----------|---------|----------------|
| 400 | Bad Request | Malformed request body |
| 401 | Unauthenticated | Missing or invalid Bearer token |
| 403 | Forbidden | Account suspended or insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 422 | Validation Error | Required fields missing or invalid |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected server-side error |

**Validation error format (422):**
```json
{
  "message": "The email field is required.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

**Unauthenticated error format (401):**
```json
{
  "message": "Unauthenticated."
}
```

---

## Rate Limiting

The API enforces rate limiting to prevent abuse:
- **Public endpoints:** 60 requests per minute per IP
- **Authenticated endpoints:** 120 requests per minute per user

When the limit is exceeded, you receive a `429 Too Many Requests` response with:
```json
{
  "message": "Too Many Attempts."
}
```

The `Retry-After` header indicates how many seconds to wait before retrying.
