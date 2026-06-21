# Sellingpoint Documentation

Production-ready international e-commerce platform — Laravel API + Filament Admin + React Native.

## Guides

| Guide | Description |
|-------|-------------|
| [Backend Setup](backend-setup.md) | Laravel installation, DB migration, seeding |
| [Mobile Setup](mobile-setup.md) | React Native Android/iOS development setup |
| [API Reference](api-reference.md) | All endpoints with request/response examples |
| [Admin Panel](admin-panel.md) | Filament admin usage and configuration |
| [Paystack Integration](paystack.md) | Payment flow, webhooks, testing |
| [OneSignal Notifications](onesignal.md) | Push notification setup |
| [Deployment](deployment.md) | Production server deployment guide |
| [Troubleshooting](troubleshooting.md) | Common issues and fixes |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/dev-bulama/sellingpoint.git
cd sellingpoint

# 2. Backend
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed

# 3. Serve
php artisan serve
# Admin: http://localhost:8000/admin
# API:   http://localhost:8000/api/v1

# 4. Mobile (separate terminal)
cd ../mobile
npm install
npx react-native run-android
```

## Demo Credentials

| Role     | Email                       | Password |
|----------|-----------------------------|----------|
| Admin    | admin@sellingpoint.com      | password |
| Customer | customer@sellingpoint.com   | password |
