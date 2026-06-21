# Physical Device Setup Guide

## Connect Android Phone to Local Laravel Backend

### Step 1: Find your PC's WiFi IP Address

**Windows:**
```
ipconfig
```
Look for: Wireless LAN adapter Wi-Fi → IPv4 Address (e.g. 192.168.1.105)

**macOS/Linux:**
```
ifconfig | grep "inet "
```

### Step 2: Start Laravel with network binding

```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8000
```

### Step 3: Update .env APP_URL

```
APP_URL=http://192.168.1.105:8000
```
(Replace with your actual IP)

Then clear config:
```bash
php artisan config:clear
php artisan cache:clear
```

### Step 4: Update mobile API URL

Edit `mobile/src/config/api.ts`:
```typescript
export const API_BASE_URL = 'http://192.168.1.105:8000/api/v1';
```

### Step 5: Verify connection

Open your phone browser and navigate to:
```
http://192.168.1.105:8000/api/v1/products
```
You should see a JSON response.

### Step 6: Run the app

```bash
cd mobile
npm run android
```

## Production Setup

Use HTTPS with a real domain:
```
APP_URL=https://api.yourdomain.com
```

Mobile:
```typescript
export const API_BASE_URL = 'https://api.yourdomain.com/api/v1';
```

## Backend Commands After Setup

```bash
php artisan storage:link
php artisan migrate --seed
php artisan optimize:clear
```

## Demo Credentials

- Admin: admin@sellingpoint.com / password
- Customer: customer@sellingpoint.com / password
