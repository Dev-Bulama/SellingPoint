# Deployment Guide

This guide walks you through deploying Sellingpoint to a production server. We use Ubuntu 22.04 on a VPS (Virtual Private Server) — available from providers like DigitalOcean, Linode, Vultr, AWS EC2, or Hetzner.

**Recommended VPS specs:**
- 2 vCPU
- 4 GB RAM
- 80 GB SSD
- Ubuntu 22.04 LTS

---

## Overview of What We Will Set Up

1. Web server (Nginx) to serve the Laravel app
2. PHP 8.2-FPM to run PHP
3. MySQL 8 for the database
4. Certbot for free SSL certificate
5. Supervisor to keep the queue worker running
6. Proper file permissions

---

## Step 1: Connect to Your Server

```bash
ssh root@YOUR_SERVER_IP
```

Once connected, create a non-root user for security:
```bash
adduser deploy
usermod -aG sudo deploy
```

Then reconnect as the deploy user or continue as root for setup.

---

## Step 2: Update the System

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl unzip
```

---

## Step 3: Install PHP 8.2

Ubuntu 22.04's default repositories include PHP 8.1. Add Ondrej's PPA for PHP 8.2:

```bash
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

sudo apt install -y \
  php8.2-fpm \
  php8.2-cli \
  php8.2-mysql \
  php8.2-mbstring \
  php8.2-xml \
  php8.2-curl \
  php8.2-gd \
  php8.2-zip \
  php8.2-bcmath \
  php8.2-intl \
  php8.2-redis
```

Verify:
```bash
php -v
```

---

## Step 4: Install Composer

```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
composer --version
```

---

## Step 5: Install MySQL 8

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

The `mysql_secure_installation` wizard will ask:
- Remove anonymous users? **Yes**
- Disallow root login remotely? **Yes**
- Remove test database? **Yes**
- Reload privilege tables? **Yes**

### Create the Production Database

```bash
sudo mysql -u root -p
```

In the MySQL prompt:
```sql
CREATE DATABASE sellingpoint CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sellingpoint'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON sellingpoint.* TO 'sellingpoint'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Replace `STRONG_PASSWORD_HERE` with a long random password. Save it — you will need it for `.env`.

---

## Step 6: Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## Step 7: Deploy the Application

```bash
cd /var/www
sudo git clone https://github.com/dev-bulama/sellingpoint.git
sudo chown -R $USER:$USER /var/www/sellingpoint
cd sellingpoint/backend
```

### Install PHP Dependencies

```bash
composer install --no-dev --optimize-autoloader
```

The `--no-dev` flag skips development-only packages (smaller, faster). The `--optimize-autoloader` flag generates a faster autoload file for production.

### Configure Environment

```bash
cp .env.example .env
nano .env
```

Edit the following values (use your actual credentials):

```env
APP_NAME=Sellingpoint
APP_ENV=production
APP_KEY=                        # Leave blank — run key:generate next
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sellingpoint
DB_USERNAME=sellingpoint
DB_PASSWORD=STRONG_PASSWORD_HERE

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database

MAIL_MAILER=smtp
MAIL_HOST=smtp.your-mail-provider.com
MAIL_PORT=587
MAIL_USERNAME=your@email.com
MAIL_PASSWORD=your-mail-password
MAIL_FROM_ADDRESS="noreply@yourdomain.com"

PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key

ONESIGNAL_APP_ID=your-onesignal-app-id
ONESIGNAL_API_KEY=your-onesignal-rest-api-key
```

Save and close (`Ctrl+X`, then `Y`, then Enter in nano).

### Generate Application Key

```bash
php artisan key:generate
```

### Run Migrations and Seed

```bash
php artisan migrate --force
php artisan db:seed --force
```

The `--force` flag allows these commands to run in production mode (they prompt for confirmation by default).

### Create Storage Symlink

```bash
php artisan storage:link
```

### Optimize for Production

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

These commands cache the configuration, routes, and views so the app does not re-parse them on every request — significantly improves performance.

---

## Step 8: Configure Nginx

Create the Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/sellingpoint
```

Paste this configuration (replace `api.yourdomain.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/sellingpoint/backend/public;
    index index.php;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    # Maximum file upload size
    client_max_body_size 50M;

    # Serve files, fall back to index.php
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Pass PHP to PHP-FPM
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 60;
    }

    # Block access to hidden files (like .env)
    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/sellingpoint /etc/nginx/sites-enabled/
sudo nginx -t               # Test config — should say "syntax is ok"
sudo systemctl reload nginx
```

---

## Step 9: Set File Permissions

```bash
sudo chown -R www-data:www-data /var/www/sellingpoint/backend
sudo find /var/www/sellingpoint/backend -type f -exec chmod 644 {} \;
sudo find /var/www/sellingpoint/backend -type d -exec chmod 755 {} \;
sudo chmod -R 775 /var/www/sellingpoint/backend/storage
sudo chmod -R 775 /var/www/sellingpoint/backend/bootstrap/cache
```

---

## Step 10: Install SSL Certificate with Certbot

HTTPS is required for the mobile app to connect to the API. Never run a production API over HTTP.

```bash
sudo apt install -y certbot python3-certbot-nginx

# Issue certificate (Certbot will automatically configure Nginx)
sudo certbot --nginx -d api.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

After Certbot runs, your Nginx config will be updated to:
- Redirect HTTP to HTTPS
- Serve HTTPS on port 443 with the certificate

---

## Step 11: Set Up Queue Worker with Supervisor

The queue worker handles background jobs (email sending, push notifications). Supervisor keeps it running and restarts it if it crashes.

```bash
sudo apt install -y supervisor
```

Create the Supervisor configuration:
```bash
sudo nano /etc/supervisor/conf.d/sellingpoint-worker.conf
```

Paste:
```ini
[program:sellingpoint-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/sellingpoint/backend/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/sellingpoint-worker.log
stopwaitsecs=3600
```

Start the workers:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start sellingpoint-worker:*
sudo supervisorctl status
```

You should see both worker processes with `RUNNING` status.

---

## Step 12: Point Your Domain to the Server

In your domain registrar's DNS settings, create an A record:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | api | YOUR_SERVER_IP | 3600 |

This makes `api.yourdomain.com` point to your server. DNS changes can take up to 48 hours to propagate worldwide (usually much faster).

---

## Step 13: Register Paystack Webhook

Now that your server is running with HTTPS, register the webhook URL in Paystack:

1. Log in to https://dashboard.paystack.com
2. Go to **Settings → API Keys & Webhooks**
3. Set **Webhook URL** to: `https://api.yourdomain.com/api/v1/payments/webhook`
4. Click **Update**

---

## Step 14: Update Mobile App API URL

Before building the release APK/AAB, update the API URL in the mobile app:

Edit `sellingpoint/mobile/src/constants/index.ts`:
```typescript
export const API_BASE_URL = 'https://api.yourdomain.com/api/v1';
```

Then build the release APK (see [ANDROID-BUILD.md](ANDROID-BUILD.md)).

---

## Updating the Application (Deployments)

When you have new code to deploy:

```bash
cd /var/www/sellingpoint/backend

# Pull latest code
git pull origin main

# Install any new PHP packages
composer install --no-dev --optimize-autoloader

# Run any new database migrations
php artisan migrate --force

# Clear and rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart queue workers (pick up new code)
sudo supervisorctl restart sellingpoint-worker:*
```

---

## Monitoring and Logs

### Application Logs
```bash
tail -f /var/www/sellingpoint/backend/storage/logs/laravel.log
```

### Nginx Access and Error Logs
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Queue Worker Logs
```bash
tail -f /var/log/sellingpoint-worker.log
```

### Check Queue Status
```bash
php /var/www/sellingpoint/backend/artisan queue:monitor
```

---

## Production Checklist

- [ ] `APP_DEBUG=false` in `.env`
- [ ] `APP_ENV=production` in `.env`
- [ ] `APP_URL` is the HTTPS domain
- [ ] Live Paystack keys configured (not test keys)
- [ ] Webhook URL registered in Paystack dashboard
- [ ] OneSignal App ID and API key configured
- [ ] SSL certificate installed and auto-renewal working
- [ ] Nginx config tested (`nginx -t`)
- [ ] File permissions set correctly (storage and bootstrap/cache writable)
- [ ] Queue worker running via Supervisor
- [ ] Storage symlink created
- [ ] Config/route/view caches generated
- [ ] Database migrations run
- [ ] Demo seeder data removed or passwords changed
- [ ] Admin password changed from default
- [ ] Mobile app API URL points to production domain
- [ ] Release APK/AAB built with production API URL

---

## Common Production Issues

### 500 Server Error
Check `storage/logs/laravel.log` for the actual error. Common causes:
- Wrong database credentials in `.env`
- Missing PHP extensions
- File permission errors on `storage/` directory

### "419 Page Expired"
The Sanctum stateful domains are not configured for the admin panel. Add to `.env`:
```env
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,api.yourdomain.com
```

### Images not loading
The storage symlink may not be created. Run: `php artisan storage:link`

### Slow API responses
Run the performance cache commands:
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Queue jobs not processing
Supervisor may have stopped. Check: `sudo supervisorctl status`
Restart: `sudo supervisorctl restart sellingpoint-worker:*`
