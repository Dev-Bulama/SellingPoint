# Admin Panel Guide

## Access

URL: `http://your-domain.com/admin`

Demo credentials:
- **Email:** admin@sellingpoint.com
- **Password:** password

## Navigation Groups

### Catalog
- **Products** — Create/edit products with variants, images, pricing
- **Categories** — Hierarchical category tree (parent + children)
- **Brands** — Brand logos and slugs

### Sales
- **Orders** — View all orders, update status, filter by date/status
- **Reviews** — Moderate customer reviews, add admin replies

### Marketing
- **Coupons** — Percentage and fixed-amount discount codes
- **Flash Sales** — Time-limited sales with start/end dates
- **Banners** — Homepage carousel banners

### Content
- **CMS Pages** — About, Terms, Privacy pages (HTML content)
- **FAQs** — Accordion FAQ entries

### Users
- **Customers** — View customer accounts, deactivate if needed
- **Admins** — Manage admin users (super-admin only)

### Configuration
- **Shipping Zones** — Nigerian states grouped by delivery zone + fee
- **Settings** — App-wide settings (Paystack keys, OneSignal, store info)

## Product Management

### Creating a Product

1. Navigate to **Catalog → Products → New Product**
2. Fill **Basic Info** tab: name, slug, category, brand, description
3. Fill **Pricing & Stock**: price, optional discount price, stock quantity
4. Upload images in the **Media** tab (first image = thumbnail)
5. Set flags in **Flags** tab: featured, new arrival, best seller, flash sale
6. Add specifications in key-value format (e.g., `Color: Black`)
7. Add variants (size, color) in **Variants** tab
8. Click **Save**

### Bulk Status Changes

Use the table action checkboxes → **Actions → Activate/Deactivate selected**.

## Order Management

### Updating Order Status

1. Open order → click **Edit**
2. Change **Status** dropdown: pending → confirmed → processing → shipped → delivered
3. Save — customer receives notification (when OneSignal is configured)

### Refunds

Manual refunds are processed through the Paystack Dashboard. After refunding, set order status to `refunded` in the admin panel.

## Settings Page

Navigate to **Configuration → Settings**:

| Tab | Settings |
|-----|---------|
| General | Store name, currency, support email/phone, address |
| Paystack | Secret key, public key |
| OneSignal | App ID, API key |
| App Update | Force update flag, minimum app version |

## Dashboard Widgets

- **Revenue** — Total revenue from paid orders
- **Orders** — Total order count
- **Customers** — Registered customer count
- **Low Stock** — Products with ≤5 items remaining (warning indicator)
- **Sales Chart** — Last 30 days revenue line chart
