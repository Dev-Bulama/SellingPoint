# Sellingpoint — Project Overview

## What Is Sellingpoint?

Sellingpoint is a full-stack, production-ready mobile e-commerce platform — think of it as the technical foundation behind apps like Jumia or Konga. It gives developers a complete, working shopping application they can launch, customize, and build a business on without starting from scratch.

Out of the box you get:

- A **mobile shopping app** (Android and iOS) customers use to browse, buy, and track orders
- A **backend API** that powers the app with products, authentication, payments, and more
- An **admin dashboard** where store owners manage products, orders, and settings

---

## Who Is This For?

Sellingpoint is built for:

- **Developers** who need to launch an e-commerce app without building everything from zero
- **Startups** that want a solid technical base to customize and deploy quickly
- **Freelancers** who need to deliver a client a complete shopping app
- **Students** learning full-stack mobile + web development with real-world code

You need basic programming knowledge — ideally some familiarity with PHP/Laravel or React Native — but the documentation is written to guide you through every step.

---

## System Components

The project has three main parts that work together:

```
+---------------------------+
|     React Native App      |  <-- Customers shop here (Android/iOS)
|   (mobile/)               |
+---------------------------+
            |
            | HTTP API calls
            v
+---------------------------+       +---------------------------+
|    Laravel REST API       | <---> |   Filament Admin Panel    |
|    (backend/)             |       |   /admin                  |
+---------------------------+       +---------------------------+
            |
            v
+---------------------------+
|    MySQL Database         |
+---------------------------+
```

### 1. Laravel Backend (`backend/`)
The heart of the platform. Handles all business logic:
- REST API consumed by the mobile app
- User authentication with Laravel Sanctum (token-based)
- Order processing, payments, and inventory
- Push notification dispatch via OneSignal
- Paystack payment integration
- Image and file storage

### 2. Filament Admin Panel (`backend/` — at `/admin`)
A feature-rich web interface built on Filament v3 for store management:
- Dashboard with revenue charts and metrics
- Product, category, and brand management
- Order management with status updates
- Customer management
- Coupon and discount creation
- Site settings (store name, currency, payment keys)

### 3. React Native Mobile App (`mobile/`)
The customer-facing shopping app:
- Works on Android (and iOS with extra setup)
- Built with TypeScript and React Navigation
- State management via Redux Toolkit and Zustand
- Paystack payment via WebView
- OneSignal push notifications

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Mobile App | React Native + TypeScript | 0.76.5 |
| Navigation | React Navigation | 6.x |
| State Management | Redux Toolkit + Zustand | Latest |
| HTTP Client | Axios | 1.7.x |
| Backend Framework | Laravel | 11.x |
| PHP Version | PHP | 8.2+ |
| Admin Panel | Filament | v3 |
| Authentication | Laravel Sanctum | Built-in |
| Database | MySQL | 8.0+ |
| Payments | Paystack | API v2 |
| Push Notifications | OneSignal | REST API |
| File Storage | Laravel Storage (local/S3) | Built-in |
| Queues | Laravel Queues (database/Redis) | Built-in |

---

## Architecture Diagram

```
+========================================================+
|                  CUSTOMER DEVICE                       |
|  +--------------------------------------------------+  |
|  |           React Native App (mobile/)             |  |
|  |  - Browse products     - Track orders           |  |
|  |  - Add to cart         - Push notifications     |  |
|  |  - Paystack checkout   - Wishlist               |  |
|  +--------------------------------------------------+  |
+========================================================+
                        |
              HTTPS API calls
              Bearer Token Auth
                        |
+========================================================+
|                BACKEND SERVER                          |
|                                                        |
|  +------------------+   +---------------------------+  |
|  |  Laravel API     |   |  Filament Admin Panel     |  |
|  |  /api/v1/*       |   |  /admin                   |  |
|  |                  |   |                           |  |
|  | - Auth           |   | - Product management     |  |
|  | - Products       |   | - Order management       |  |
|  | - Cart           |   | - Customer management    |  |
|  | - Orders         |   | - Settings               |  |
|  | - Payments       |   | - Coupons                |  |
|  | - Notifications  |   | - Banners                |  |
|  +------------------+   +---------------------------+  |
|           |                                            |
|  +------------------+   +---------------------------+  |
|  |  MySQL Database  |   |  Laravel Queue Worker     |  |
|  |  (all app data)  |   |  (emails, notifications)  |  |
|  +------------------+   +---------------------------+  |
+========================================================+
                        |
          +--------------------------+
          |    Third-Party Services  |
          |  +--------------------+  |
          |  | Paystack (payment) |  |
          |  +--------------------+  |
          |  +--------------------+  |
          |  | OneSignal (push)   |  |
          |  +--------------------+  |
          |  +--------------------+  |
          |  | AWS S3 (optional)  |  |
          |  +--------------------+  |
          +--------------------------+
```

---

## Feature List

### Shopping App Features
- **Product Browsing** — Browse by category, brand, search, and filter
- **Product Detail** — Image gallery, variants (size/color), reviews, related products
- **Featured Collections** — Featured, New Arrivals, Best Sellers, Flash Sales
- **Shopping Cart** — Add, update, remove items; persistent across sessions
- **Wishlist** — Save products for later
- **Checkout** — Select delivery address, apply coupon, confirm order
- **Paystack Payment** — Secure card payment via Paystack checkout
- **Order Tracking** — View order status (pending → processing → shipped → delivered)
- **Order History** — Full list of past orders with detail view
- **User Profile** — Name, phone, avatar, date of birth
- **Delivery Addresses** — Multiple addresses with default selection
- **Push Notifications** — Real-time order status updates via OneSignal
- **In-App Notifications** — Notification inbox with read/unread status
- **Product Reviews** — Rate and review purchased products
- **Coupons** — Apply discount codes at checkout

### Admin Panel Features
- **Dashboard** — Revenue, orders, customers, low stock alerts, sales chart
- **Product Management** — Create/edit products with images, variants, categories, brands
- **Order Management** — View and update order statuses
- **Customer Management** — View customer profiles and order history
- **Category & Brand Management** — Organize the product catalog
- **Coupon Management** — Create percentage or fixed-amount discounts with expiry
- **Banner Management** — Homepage promotional banners
- **CMS Pages** — About, Privacy Policy, Terms pages
- **FAQs** — Manage frequently asked questions
- **Shipping Zones** — Configure shipping rates by region
- **Settings** — Store name, currency, Paystack keys, OneSignal keys

---

## Demo Credentials

After running the database seeder (`php artisan db:seed`), these accounts are ready to use:

### Admin Panel — http://localhost:8000/admin
| Field | Value |
|-------|-------|
| Email | admin@sellingpoint.com |
| Password | password |

### Customer App
| Field | Value |
|-------|-------|
| Email | customer@sellingpoint.com |
| Password | password |

> **Important:** Change these passwords immediately in any production deployment. Never use the default demo credentials on a live server.

---

## Repository Structure

```
sellingpoint/
├── backend/                  Laravel API + Filament Admin
│   ├── app/
│   │   ├── Http/Controllers/Api/   API endpoint controllers
│   │   ├── Models/                 Database models
│   │   ├── Filament/               Admin panel resources
│   │   └── Services/               Business logic services
│   ├── database/
│   │   ├── migrations/             Database table definitions
│   │   └── seeders/                Demo data seeders
│   ├── routes/
│   │   └── api.php                 All API route definitions
│   └── .env.example                Environment variable template
│
├── mobile/                   React Native App
│   ├── src/
│   │   ├── screens/                App screens
│   │   ├── components/             Reusable UI components
│   │   ├── store/                  Redux state management
│   │   ├── api/                    API call functions
│   │   └── constants/              App constants (API URL, colors)
│   ├── android/                    Android-specific files
│   └── package.json                Dependencies
│
└── docs/                     Documentation (you are here)
```
