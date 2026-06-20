# Backend Setup Guide

## Requirements

- PHP 8.2+
- MySQL 8.0+
- Composer 2.x
- Node.js 18+ (for asset compilation)

## Installation

```bash
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure .env
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=sellingpoint
# DB_USERNAME=root
# DB_PASSWORD=your_password
#
# PAYSTACK_SECRET_KEY=sk_test_xxxx
# PAYSTACK_PUBLIC_KEY=pk_test_xxxx
#
# ONESIGNAL_APP_ID=your-app-id
# ONESIGNAL_API_KEY=your-api-key

# Create database
mysql -u root -p -e "CREATE DATABASE sellingpoint CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations
php artisan migrate

# Seed demo data
php artisan db:seed

# Create storage symlink
php artisan storage:link

# Start dev server
php artisan serve
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `APP_URL` | Backend URL | `http://localhost:8000` |
| `DB_DATABASE` | MySQL database name | `sellingpoint` |
| `PAYSTACK_SECRET_KEY` | Paystack secret key | `sk_test_xxxx` |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key | `pk_test_xxxx` |
| `ONESIGNAL_APP_ID` | OneSignal App ID | UUID |
| `ONESIGNAL_API_KEY` | OneSignal REST API Key | string |
| `QUEUE_CONNECTION` | Queue driver | `database` or `redis` |

## Queue Worker

For order notifications and emails:

```bash
php artisan queue:work --sleep=3 --tries=3
```

## Admin Panel

After seeding, visit `/admin` and log in with:
- **Email:** admin@sellingpoint.com
- **Password:** password

## Roles

- `admin` — Full Filament panel access
- `customer` — API-only access (mobile app)

New customers are auto-assigned the `customer` role on registration.
