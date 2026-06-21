# Admin Panel Guide

The Sellingpoint admin panel is built on Filament v3 — a powerful Laravel admin framework with a clean, modern interface. This guide walks you through every section with click-by-click instructions.

**Access the admin panel at:** http://localhost:8000/admin (development) or https://yourdomain.com/admin (production)

---

## Logging In

1. Open your browser and go to http://localhost:8000/admin
2. You will see the Sellingpoint login page
3. Enter the email address: `admin@sellingpoint.com`
4. Enter the password: `password`
5. Click the **Sign in** button
6. You will be redirected to the dashboard

> In production, use the real admin email and a strong unique password. Change the default password immediately.

---

## The Dashboard

After logging in, you land on the dashboard. It contains widgets that give you a quick overview of your store's health.

### Dashboard Widgets

**Stats Row (top of page):**
- **Total Revenue** — Sum of all paid orders (in your store currency)
- **Total Orders** — Number of orders placed (all statuses)
- **New Customers** — Customers who registered in the current month
- **Low Stock Products** — Count of products with stock below the alert threshold (usually 5 units)

**Sales Chart:**
A line graph showing daily revenue for the past 30 days. Look for trends — peaks may indicate flash sale days, dips may indicate website issues.

**Recent Orders:**
A table showing the last 10 orders. Each row shows:
- Order number
- Customer name
- Order total
- Current status
- Date placed

Click any order number to go directly to that order's detail page.

---

## Managing Products

Products are the core of your store. This section explains how to create a new product from scratch.

### Viewing All Products

1. Click **Products** in the left sidebar
2. You see a table of all products with columns: Image, Name, Category, Price, Stock, Status
3. Use the **search bar** at the top to find a product by name
4. Use the **filters** (funnel icon) to filter by category, brand, or status
5. Click any product row to edit it

### Creating a New Product

1. Click **Products** in the left sidebar
2. Click the **New product** button (top right, orange/primary color)
3. You will see the product creation form with multiple tabs

**Tab 1: Details**

Fill in each field:

- **Name** — The product's display name (e.g., "Samsung Galaxy S24 Ultra")
- **Slug** — The URL-friendly version of the name. Filament auto-generates this when you type the name. Example: `samsung-galaxy-s24-ultra`. Only change this if you want a custom URL.
- **Category** — Select from the dropdown. If the category does not exist, create it first (see Managing Categories below).
- **Brand** — Select from the dropdown. Optional but recommended.
- **Short Description** — A 1–2 sentence summary shown on product cards in the app.
- **Description** — The full product description. Supports rich text formatting (bold, lists, etc.).
- **Is Featured** — Toggle on to show this product in the "Featured" collection on the home screen.
- **Is Active** — Toggle on to make the product visible to customers. Toggle off to hide it (e.g., while you are preparing it).

**Tab 2: Media**

1. Click the image upload area or drag and drop images onto it
2. You can upload multiple images — the first one becomes the main product image
3. Supported formats: JPG, PNG, WebP
4. Recommended image size: 800x800 pixels (square works best for product grids)
5. To reorder images, drag them into the desired order

**Tab 3: Pricing**

- **Price** — The regular selling price (in your store currency, e.g., 15000 for ₦15,000)
- **Discount Price** — Optional. If set, this becomes the selling price and the original Price is shown crossed-out. Leave blank for no discount.
- **Cost Price** — Optional. Your purchase cost — used for profit calculations in reports. Not shown to customers.

**Tab 4: Inventory**

- **SKU** — Stock Keeping Unit. A unique code for your internal tracking (e.g., `SAMSUNG-S24-BLK`). Optional.
- **Stock Quantity** — How many units you have. Set to 0 to show "Out of Stock".
- **Manage Stock** — Toggle on if you want stock to decrease automatically when orders are placed.
- **Low Stock Threshold** — Get a dashboard alert when stock falls below this number.

**Tab 5: Variants (optional)**

Use variants if your product comes in different options (e.g., colors or sizes).

1. Click **Add variant**
2. Enter a variant name (e.g., "Color" or "Size")
3. Add options for that variant (e.g., "Red", "Blue", "Green")
4. Each combination can have its own price and stock (or inherit from the parent product)

4. Click **Save** (top right) when done

---

### Editing an Existing Product

1. Click **Products** in the sidebar
2. Find the product (use search if needed)
3. Click the product row or the pencil (edit) icon
4. Make your changes
5. Click **Save**

### Deleting a Product

1. Click the product row to open it
2. Click the **Delete** button (usually red, bottom of page)
3. Confirm the deletion

> Deleting a product removes it from all future orders. Historical orders referencing the product still exist in the database.

---

## Managing Categories

Categories organize your products into groups (Electronics, Fashion, Home & Garden, etc.).

1. Click **Categories** in the left sidebar
2. Click **New category**
3. Fill in:
   - **Name** — e.g., "Electronics"
   - **Slug** — auto-generated, e.g., "electronics"
   - **Icon** — optional emoji or icon identifier
   - **Parent** — set if this is a sub-category (e.g., "Phones" inside "Electronics")
   - **Is Active** — must be on for the category to appear in the app
4. Click **Save**

---

## Managing Orders

When a customer places an order, it appears here. You update orders as you process them.

### Viewing Orders

1. Click **Orders** in the left sidebar
2. You see a table of all orders sorted by most recent
3. The Status column shows the current order state:
   - **Pending** — Order placed, payment not yet confirmed
   - **Processing** — Payment confirmed, being prepared
   - **Shipped** — Package dispatched
   - **Delivered** — Customer received the package
   - **Cancelled** — Order was cancelled

### Updating an Order Status

1. Click the order number to open it
2. Review the order details:
   - Customer name and contact
   - Delivery address
   - Items ordered (product, quantity, price)
   - Payment status
   - Order total
3. Find the **Status** dropdown
4. Select the new status (e.g., change from "Processing" to "Shipped")
5. Optionally add a note in the **Notes** field
6. Click **Save**

When you update the status, the system automatically sends a push notification to the customer (if OneSignal is configured). For example:
- Changing to "Shipped" sends: "Your order #SP12345 has been shipped!"
- Changing to "Delivered" sends: "Your order #SP12345 has been delivered!"

---

## Managing Customers

1. Click **Customers** in the left sidebar
2. Browse or search the customer list
3. Click a customer to view:
   - Profile info (name, email, phone)
   - Order history
   - Total spent
   - Registration date
   - Account status (active/suspended)

To **suspend a customer** (block them from logging in):
1. Open the customer record
2. Toggle **Is Active** to off
3. Click Save

---

## Configuring Store Settings

Settings control how your store behaves. Go to **Configuration → Settings** in the left sidebar.

### General Tab
- **Store Name** — Displayed in emails and the app header
- **Store Currency** — The currency shown throughout the app (e.g., NGN, USD)
- **Currency Symbol** — The symbol (e.g., ₦, $)
- **Support Email** — Shown on the contact page and in order emails
- **Support Phone** — Shown to customers for customer service

### Paystack Tab
- **Paystack Secret Key** — Your `sk_test_...` or `sk_live_...` key
- **Paystack Public Key** — Your `pk_test_...` or `pk_live_...` key

You can also set these directly in the backend `.env` file (which takes precedence over the database settings).

### OneSignal Tab
- **OneSignal App ID** — Your OneSignal application identifier
- **OneSignal REST API Key** — Used by the backend to send notifications

---

## Creating Coupons

Coupons let customers get discounts. You can create percentage-off or fixed-amount discounts.

1. Click **Marketing** → **Coupons** in the left sidebar
2. Click **New coupon**
3. Fill in the form:

   - **Code** — The code customers enter at checkout (e.g., `WELCOME10`, `SAVE500`). Use uppercase letters and numbers. No spaces.
   - **Type** — Choose one:
     - **Percentage** — Discounts by a percentage of the order total (e.g., 10% off)
     - **Fixed Amount** — Discounts by a fixed amount (e.g., ₦500 off)
   - **Value** — The discount amount. For Percentage type, enter `10` for 10%. For Fixed, enter `500` for ₦500 off.
   - **Minimum Order Amount** — Optional. Coupon only applies if the order total is at or above this amount.
   - **Maximum Discount Amount** — Optional (for percentage coupons). Caps how much can be discounted.
   - **Usage Limit** — How many times the coupon can be used in total. Leave blank for unlimited.
   - **Per User Limit** — How many times a single customer can use it. Set to `1` for one-time-use coupons.
   - **Expires At** — Optional expiry date. After this date the coupon no longer works.
   - **Is Active** — Must be on for the coupon to be usable

4. Click **Save**

**Example — Welcome coupon:**
- Code: `WELCOME10`
- Type: Percentage
- Value: 10
- Per User Limit: 1
- Expires At: (leave blank)

---

## Managing Banners

Banners are the promotional images shown at the top of the app home screen.

1. Click **CMS** → **Banners** in the left sidebar
2. Click **New banner**
3. Fill in:
   - **Title** — Internal name (not shown to customers)
   - **Image** — Upload a banner image (recommended: 1200x500 pixels)
   - **Link Type** — Where tapping the banner goes: Product, Category, URL, or None
   - **Sort Order** — Controls the display order. Lower numbers appear first.
   - **Is Active** — Toggle on to show the banner

---

## Managing Shipping Zones

Shipping zones define delivery areas and costs.

1. Click **Configuration** → **Shipping Zones**
2. Click **New shipping zone**
3. Fill in:
   - **Name** — e.g., "Lagos", "Within Lagos", "Other States"
   - **States/Regions** — Select which states/regions this zone covers
   - **Rate** — Delivery cost for this zone
   - **Free Shipping Threshold** — Optional minimum order amount to get free delivery
4. Click **Save**

---

## Managing FAQs

FAQs appear on the app's Help/FAQ screen.

1. Click **CMS** → **FAQs**
2. Click **New FAQ**
3. Enter the **Question** and **Answer**
4. Set **Sort Order** (lower = appears first)
5. Toggle **Is Active** on
6. Click **Save**

---

## Admin Panel Tips

- **Keyboard shortcut:** Press `/` to quickly search the admin panel
- **Bulk actions:** Check multiple rows in a list and use the bulk action dropdown to delete or change status for many records at once
- **Export:** Most list views have an export button to download data as CSV
- **Filter + Search:** Combine filters and the search bar for precise results in large datasets
- **Activity Log:** Some resources show a log of who changed what and when — useful for auditing

---

## Next Steps

- [API Documentation](API-DOCS.md) — How the mobile app communicates with the backend
- [Payment Guide](PAYMENT-GUIDE.md) — Configuring Paystack
- [OneSignal Guide](ONESIGNAL-GUIDE.md) — Setting up push notifications
