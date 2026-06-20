# API Reference

Base URL: `POST /api/v1/`

All authenticated endpoints require: `Authorization: Bearer {token}`

---

## Authentication

### Register
`POST /api/v1/auth/register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+2348012345678",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Response 201:**
```json
{
  "message": "Registration successful",
  "token": "1|abc123...",
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com" }
}
```

### Login
`POST /api/v1/auth/login`

**Request:**
```json
{ "email": "john@example.com", "password": "password123" }
```

**Response 200:**
```json
{
  "message": "Login successful",
  "token": "2|xyz456...",
  "user": { ... }
}
```

### Get Profile *(auth)*
`GET /api/v1/auth/profile`

### Update Profile *(auth)*
`POST /api/v1/auth/profile` — multipart/form-data

Fields: `name`, `phone`, `gender`, `date_of_birth`, `avatar` (file)

### Change Password *(auth)*
`POST /api/v1/auth/change-password`

```json
{
  "current_password": "old",
  "password": "newpass123",
  "password_confirmation": "newpass123"
}
```

### Forgot Password
`POST /api/v1/auth/forgot-password`

```json
{ "email": "john@example.com" }
```

### Reset Password
`POST /api/v1/auth/reset-password`

```json
{
  "email": "john@example.com",
  "otp": "123456",
  "password": "newpass123",
  "password_confirmation": "newpass123"
}
```

---

## Products (Public)

### List Products
`GET /api/v1/products`

**Query params:** `page`, `per_page`, `category`, `brand`, `search`, `sort` (latest|price_asc|price_desc|popular|rating), `min_price`, `max_price`

### Featured Products
`GET /api/v1/products/featured`

### New Arrivals
`GET /api/v1/products/new-arrivals`

### Best Sellers
`GET /api/v1/products/best-sellers`

### Flash Sales
`GET /api/v1/products/flash-sales`

### Product Detail
`GET /api/v1/products/{slug}`

### Related Products
`GET /api/v1/products/{slug}/related`

### Product Reviews
`GET /api/v1/products/{slug}/reviews`

### Categories
`GET /api/v1/categories`

### Brands
`GET /api/v1/brands`

---

## Cart *(auth)*

### Get Cart
`GET /api/v1/cart`

### Add to Cart
`POST /api/v1/cart/add`

```json
{
  "product_id": 1,
  "variant_id": 2,
  "quantity": 1
}
```

### Update Item Quantity
`PUT /api/v1/cart/items/{id}`

```json
{ "quantity": 3 }
```

### Remove Item
`DELETE /api/v1/cart/items/{id}`

### Clear Cart
`DELETE /api/v1/cart/clear`

---

## Wishlist *(auth)*

### Get Wishlist
`GET /api/v1/wishlist`

### Toggle Product
`POST /api/v1/wishlist/toggle`

```json
{ "product_id": 1 }
```

### Check if Wishlisted
`GET /api/v1/wishlist/check/{productId}`

---

## Orders *(auth)*

### List Orders
`GET /api/v1/orders`

### Checkout
`POST /api/v1/orders/checkout`

```json
{
  "address_id": 1,
  "payment_method": "paystack",
  "coupon_code": "WELCOME10"
}
```

**Response:**
```json
{
  "message": "Order placed successfully",
  "data": {
    "order_number": "SPXYZ123",
    "total": 15000,
    "status": "pending"
  }
}
```

### Validate Coupon
`POST /api/v1/orders/validate-coupon`

```json
{ "code": "WELCOME10", "subtotal": 20000 }
```

### Order Detail
`GET /api/v1/orders/{orderNumber}`

### Cancel Order
`POST /api/v1/orders/{orderNumber}/cancel`

---

## Payments *(auth)*

### Initialize Payment
`POST /api/v1/payments/initialize`

```json
{ "order_number": "SPXYZ123" }
```

**Response:**
```json
{
  "authorization_url": "https://checkout.paystack.com/...",
  "access_code": "abc123",
  "reference": "ref_xyz"
}
```

### Verify Payment
`POST /api/v1/payments/verify`

```json
{ "reference": "ref_xyz" }
```

### Paystack Webhook (Public)
`POST /api/v1/payments/webhook`

Verified using `X-Paystack-Signature` HMAC-SHA512 header.

---

## Addresses *(auth)*

### List
`GET /api/v1/addresses`

### Create
`POST /api/v1/addresses`

```json
{
  "full_name": "John Doe",
  "phone": "+2348012345678",
  "address_line1": "12 Main Street",
  "city": "Lagos",
  "state": "Lagos State",
  "country": "Nigeria",
  "is_default": true
}
```

### Update
`PUT /api/v1/addresses/{id}`

### Delete
`DELETE /api/v1/addresses/{id}`

### Set Default
`POST /api/v1/addresses/{id}/set-default`

---

## Reviews *(auth)*

### Submit Review
`POST /api/v1/reviews`

```json
{
  "product_id": 1,
  "rating": 5,
  "title": "Great product!",
  "body": "Arrived on time and works perfectly."
}
```

---

## Notifications *(auth)*

### List
`GET /api/v1/notifications`

### Mark Read
`POST /api/v1/notifications/{id}/read`

### Mark All Read
`POST /api/v1/notifications/mark-all-read`

### Save Push Token
`POST /api/v1/notifications/push-token`

```json
{ "token": "onesignal-player-id", "platform": "android" }
```

---

## CMS (Public)

### Banners
`GET /api/v1/cms/banners`

### Flash Sales
`GET /api/v1/cms/flash-sales`

### Settings
`GET /api/v1/cms/settings`

### FAQs
`GET /api/v1/cms/faqs`

### Page
`GET /api/v1/cms/pages/{slug}`

---

## Error Responses

| Code | Meaning |
|------|---------|
| 401 | Unauthenticated — invalid/missing token |
| 403 | Forbidden — account deactivated |
| 404 | Resource not found |
| 422 | Validation error |
| 500 | Server error |

**Validation error format:**
```json
{
  "message": "The email field is required.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```
