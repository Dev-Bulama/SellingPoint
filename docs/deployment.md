# Deployment Guide

## Backend Deployment (Ubuntu/Debian VPS)

### Requirements

- Ubuntu 22.04+
- Nginx or Apache
- PHP 8.2-FPM
- MySQL 8.0
- Composer
- Certbot (HTTPS)

### 1. Install PHP 8.2

```bash
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install php8.2-fpm php8.2-mysql php8.2-mbstring php8.2-xml \
     php8.2-curl php8.2-gd php8.2-intl php8.2-zip php8.2-bcmath
```

### 2. Install Nginx

```bash
sudo apt install nginx
```

### 3. Clone and Configure

```bash
cd /var/www
git clone https://github.com/dev-bulama/sellingpoint.git
cd sellingpoint/backend

composer install --no-dev --optimize-autoloader
cp .env.example .env
# Edit .env with production values
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 4. Nginx Config

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/sellingpoint/backend/public;
    index index.php;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### 5. HTTPS with Certbot

```bash
sudo certbot --nginx -d api.yourdomain.com
```

### 6. Queue Worker (Supervisor)

```ini
; /etc/supervisor/conf.d/sellingpoint-worker.conf
[program:sellingpoint-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/sellingpoint/backend/artisan queue:work database --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/sellingpoint-worker.log
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start sellingpoint-worker:*
```

### 7. File Permissions

```bash
sudo chown -R www-data:www-data /var/www/sellingpoint/backend
sudo chmod -R 755 /var/www/sellingpoint/backend/storage
sudo chmod -R 755 /var/www/sellingpoint/backend/bootstrap/cache
```

---

## Mobile App Release

### Android APK / AAB

```bash
cd mobile/android

# Generate keystore (first time only)
keytool -genkey -v -keystore sellingpoint.keystore \
  -alias sellingpoint -keyalg RSA -keysize 2048 -validity 10000

# Configure android/gradle.properties
MYAPP_RELEASE_STORE_FILE=sellingpoint.keystore
MYAPP_RELEASE_KEY_ALIAS=sellingpoint
MYAPP_RELEASE_STORE_PASSWORD=your_password
MYAPP_RELEASE_KEY_PASSWORD=your_password

# Build
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Update API URL for Production

Edit `mobile/src/constants/index.ts`:

```typescript
export const API_BASE_URL = 'https://api.yourdomain.com/api/v1';
```

---

## Environment Checklist

- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `APP_URL` set to production domain
- [ ] `DB_*` pointing to production MySQL
- [ ] `PAYSTACK_SECRET_KEY` is **live** key (not test)
- [ ] `ONESIGNAL_APP_ID` and `ONESIGNAL_API_KEY` set
- [ ] `QUEUE_CONNECTION=database` or `redis`
- [ ] Webhook URL registered in Paystack dashboard
- [ ] SSL certificate installed
- [ ] Queue worker running via Supervisor
- [ ] Storage symlink created
- [ ] Config/route cache cleared after deploys
