# SellingPoint — Complete Launch Guide

Everything in order. Follow each section sequentially.

---

## TABLE OF CONTENTS

1. [Get the Code onto Your Machine](#1-get-the-code-onto-your-machine)
2. [Set Up the Backend Server (VPS)](#2-set-up-the-backend-server-vps)
3. [Point a Domain to Your Server](#3-point-a-domain-to-your-server)
4. [Configure Nginx + SSL](#4-configure-nginx--ssl)
5. [Configure the Laravel Backend](#5-configure-the-laravel-backend)
6. [Configure the Admin Panel](#6-configure-the-admin-panel)
7. [Configure the Mobile App Bootstrap URL](#7-configure-the-mobile-app-bootstrap-url)
8. [Build the Android APK and AAB](#8-build-the-android-apk-and-aab)
9. [Submit to Google Play Store](#9-submit-to-google-play-store)
10. [Build the iOS App](#10-build-the-ios-app)
11. [Submit to Apple App Store](#11-submit-to-apple-app-store)
12. [After Launch — Updating the App](#12-after-launch--updating-the-app)

---

## 1. GET THE CODE ONTO YOUR MACHINE

### On your development machine (Windows / Mac / Linux)

```bash
# Clone the repository
git clone https://github.com/dev-bulama/sellingpoint.git
cd sellingpoint
```

---

## 2. SET UP THE BACKEND SERVER (VPS)

### 2.1 — Rent a VPS

Recommended providers: DigitalOcean, Hetzner, Contabo, AWS EC2, Linode.

Minimum specs:
- Ubuntu 22.04 LTS
- 2 vCPU
- 4 GB RAM
- 80 GB SSD

After purchase you will receive:
- A server IP address (e.g., `123.456.78.90`)
- SSH root credentials

### 2.2 — Connect to the Server

```bash
ssh root@YOUR_SERVER_IP
```

### 2.3 — Create a Non-Root User

```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

All remaining server commands run as the `deploy` user.

### 2.4 — Update the System

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl unzip zip wget
```

### 2.5 — Install PHP 8.2

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
  php8.2-redis \
  php8.2-tokenizer \
  php8.2-fileinfo
```

Verify:
```bash
php -v
# Expected: PHP 8.2.x
```

### 2.6 — Install Composer

```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
composer --version
```

### 2.7 — Install MySQL 8

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

The wizard will ask a series of questions. Answer:
- Set root password: **Yes** → enter a strong password
- Remove anonymous users: **Yes**
- Disallow root login remotely: **Yes**
- Remove test database: **Yes**
- Reload privileges: **Yes**

Create the production database:
```bash
sudo mysql -u root -p
```

In the MySQL prompt:
```sql
CREATE DATABASE sellingpoint CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sellingpoint'@'localhost' IDENTIFIED BY 'CHANGE_THIS_TO_A_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON sellingpoint.* TO 'sellingpoint'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Save the database password — you will need it in the `.env` file.

### 2.8 — Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 2.9 — Deploy the Application Code

```bash
cd /var/www
sudo git clone https://github.com/dev-bulama/sellingpoint.git
sudo chown -R deploy:deploy /var/www/sellingpoint
cd /var/www/sellingpoint/backend
```

Install PHP dependencies:
```bash
composer install --no-dev --optimize-autoloader
```

---

## 3. POINT A DOMAIN TO YOUR SERVER

In your domain registrar's DNS control panel (Namecheap, GoDaddy, Cloudflare, etc.), add these DNS records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` | `YOUR_SERVER_IP` | 3600 |
| A | `api` | `YOUR_SERVER_IP` | 3600 |
| A | `www` | `YOUR_SERVER_IP` | 3600 |

This makes:
- `yourdomain.com` → your server
- `api.yourdomain.com` → your server (the mobile app will connect here)

DNS changes take 5 minutes to 48 hours to propagate. You can check propagation at https://dnschecker.org

---

## 4. CONFIGURE NGINX + SSL

### 4.1 — Create the Nginx Site Config

```bash
sudo nano /etc/nginx/sites-available/sellingpoint
```

Paste this (replace `api.yourdomain.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/sellingpoint/backend/public;
    index index.php;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    # Max upload size (for product images)
    client_max_body_size 50M;

    # Serve files, fallback to Laravel
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP-FPM
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 60;
    }

    # Block .env and hidden files
    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Press `Ctrl+X`, then `Y`, then `Enter` to save.

### 4.2 — Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/sellingpoint /etc/nginx/sites-enabled/
sudo nginx -t
# Must say: syntax is ok / test is successful
sudo systemctl reload nginx
```

### 4.3 — Install SSL Certificate (Free, Auto-Renewing)

```bash
sudo apt install -y certbot python3-certbot-nginx

# Issue the certificate (DNS must have propagated first)
sudo certbot --nginx -d api.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

Certbot automatically edits your Nginx config to:
- Serve HTTPS on port 443
- Redirect all HTTP traffic to HTTPS

After this step `https://api.yourdomain.com` should return a response.

### 4.4 — Set File Permissions

```bash
sudo chown -R www-data:www-data /var/www/sellingpoint/backend
sudo find /var/www/sellingpoint/backend -type f -exec chmod 644 {} \;
sudo find /var/www/sellingpoint/backend -type d -exec chmod 755 {} \;
sudo chmod -R 775 /var/www/sellingpoint/backend/storage
sudo chmod -R 775 /var/www/sellingpoint/backend/bootstrap/cache
```

---

## 5. CONFIGURE THE LARAVEL BACKEND

### 5.1 — Create the .env File

```bash
cd /var/www/sellingpoint/backend
cp .env.example .env
nano .env
```

Fill in every value below. Do not leave any blank:

```env
APP_NAME=SellingPoint
APP_ENV=production
APP_KEY=                            # Leave blank — next step generates this
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

LOG_CHANNEL=daily
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sellingpoint
DB_USERNAME=sellingpoint
DB_PASSWORD=CHANGE_THIS_TO_YOUR_DB_PASSWORD

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database

FILESYSTEM_DISK=public

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com            # or your mail provider
MAIL_PORT=587
MAIL_USERNAME=your@email.com
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME=SellingPoint

PAYSTACK_SECRET=sk_live_YOUR_LIVE_SECRET_KEY
PAYSTACK_PUBLIC_KEY=pk_live_YOUR_LIVE_PUBLIC_KEY

ONESIGNAL_APP_ID=your-onesignal-app-id
ONESIGNAL_API_KEY=your-onesignal-rest-api-key
```

Save the file (`Ctrl+X`, `Y`, `Enter`).

### 5.2 — Generate Application Key

```bash
php artisan key:generate
```

This fills in `APP_KEY` in your `.env`. Do this only once.

### 5.3 — Run Database Migrations

```bash
php artisan migrate --force
```

The `--force` flag is required because Laravel asks for confirmation when `APP_ENV=production`.

### 5.4 — Seed the Database (optional — for demo data)

```bash
php artisan db:seed --force
```

Skip this if you want a clean database with no demo products/users.

### 5.5 — Create Storage Symlink

This makes uploaded images accessible from the web:

```bash
php artisan storage:link
```

Verify it worked:
```bash
ls -la /var/www/sellingpoint/backend/public/storage
# Should show a symlink pointing to ../storage/app/public
```

### 5.6 — Build Production Caches

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

This speeds up the app significantly. Run these every time you deploy new code.

### 5.7 — Set Up the Queue Worker with Supervisor

The queue worker handles background jobs: email notifications, push notifications, etc. Without it these features silently fail.

```bash
sudo apt install -y supervisor
```

Create the configuration file:
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

You should see two workers with `RUNNING` status.

Enable Supervisor to start on boot:
```bash
sudo systemctl enable supervisor
```

### 5.8 — Verify the Backend is Working

```bash
curl https://api.yourdomain.com/api/v1/cms/settings
```

You should get a JSON response with app settings. If you get an error, check:
```bash
tail -50 /var/www/sellingpoint/backend/storage/logs/laravel.log
```

---

## 6. CONFIGURE THE ADMIN PANEL

Open your browser and go to: `https://api.yourdomain.com/admin`

Default credentials (change these immediately after first login):
- Email: `admin@sellingpoint.com`
- Password: `password`

### 6.1 — Change Admin Password

Click your name → **Profile** → change password to something strong.

### 6.2 — Settings → General

| Field | Value |
|---|---|
| App Name | SellingPoint (or your brand name) |
| App Logo | Upload your logo (512×512 PNG recommended) |
| Support Email | your support email |
| Support Phone | your phone number |
| WhatsApp Number | your WhatsApp number (digits only, with country code) |
| Currency | NGN |
| Currency Symbol | ₦ |
| Cash on Delivery | ON or OFF based on your preference |
| Maintenance Mode | OFF |

### 6.3 — Settings → Paystack

| Field | Value |
|---|---|
| Paystack Mode | Live |
| Public Key | `pk_live_xxxxxxxxxxxxxxxx` |
| Secret Key | `sk_live_xxxxxxxxxxxxxxxx` |

Get these keys from https://dashboard.paystack.com → Settings → API Keys & Webhooks.

### 6.4 — Settings → Environment

| Field | Value |
|---|---|
| Active Environment | Production |
| Local API URL | `http://10.0.2.2:8000/api/v1` (keep for dev) |
| Production API URL | `https://api.yourdomain.com/api/v1` |
| Production Domain | `https://api.yourdomain.com` |
| Force Mobile App to Use Production | **ON** |

Click **Save Settings**.

### 6.5 — Register Paystack Webhook

In the Paystack dashboard → Settings → API Keys & Webhooks:

Set **Webhook URL** to:
```
https://api.yourdomain.com/api/v1/payments/webhook
```

Click Update. This allows Paystack to notify your server of successful payments.

---

## 7. CONFIGURE THE MOBILE APP BOOTSTRAP URL

This is the only code change needed before building. Open:

```
mobile/src/config/api.ts
```

Set your production URL:
```typescript
const PRODUCTION_API_URL = 'https://api.yourdomain.com/api/v1';
```

This is the URL used only for the very first settings fetch on app startup. All subsequent API calls use the URL configured in the admin panel.

---

## 8. BUILD THE ANDROID APK AND AAB

Do all of this on your **development machine** (not the server).

### Prerequisites Check

Make sure you have these installed:
```bash
node --version      # Must be 18+
java -version       # Must be 17
npx react-native --version
```

If Node or Java is missing, install them first (see docs/MOBILE-SETUP.md).

### 8.1 — Install JavaScript Dependencies

```bash
cd sellingpoint/mobile
npm install
```

### 8.2 — Generate the Signing Keystore (ONE TIME ONLY)

**Do this once. Never lose this file. Back it up in multiple places.**

```bash
keytool -genkeypair -v \
  -keystore sellingpoint.keystore \
  -alias sellingpoint \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

On Windows (run in Command Prompt, not PowerShell):
```
keytool -genkeypair -v -keystore sellingpoint.keystore -alias sellingpoint -keyalg RSA -keysize 2048 -validity 10000
```

Answer the prompts:
```
Enter keystore password:  (create a strong password — WRITE IT DOWN)
Re-enter new password:    (same password)
First and last name:      Your Name
Organizational unit:      Engineering
Organization:             Your Company
City:                     Lagos
State:                    Lagos State
Country code:             NG
Correct? [yes]:           yes
Key password (Enter to use same): (press Enter)
```

This creates `sellingpoint.keystore`. Copy it into the Android app folder:
```bash
cp sellingpoint.keystore android/app/sellingpoint.keystore
```

Back it up immediately:
```bash
# Copy to a safe location — USB drive, Google Drive, email to yourself, etc.
# If you lose this file you can NEVER update the app on Play Store
```

### 8.3 — Configure Signing Credentials

Open `android/gradle.properties` and add these four lines at the bottom:

```properties
MYAPP_RELEASE_STORE_FILE=sellingpoint.keystore
MYAPP_RELEASE_KEY_ALIAS=sellingpoint
MYAPP_RELEASE_STORE_PASSWORD=YOUR_PASSWORD_FROM_ABOVE
MYAPP_RELEASE_KEY_PASSWORD=YOUR_PASSWORD_FROM_ABOVE
```

Replace `YOUR_PASSWORD_FROM_ABOVE` with the actual password you set in Step 8.2.

### 8.4 — Configure build.gradle

Open `android/app/build.gradle`. Find the `android { ... }` block and add/verify these sections:

```gradle
android {
    compileSdkVersion 34

    defaultConfig {
        applicationId "com.sellingpoint"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 1           // increment this for every Play Store upload
        versionName "1.0.0"     // what users see
    }

    signingConfigs {
        release {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

Also ensure the vector icons font is included. Add inside `android { ... }`:
```gradle
project.ext.vectoricons = [
    iconFontNames: [ 'Ionicons.ttf' ]
]
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

### 8.5 — Build the Release AAB (for Play Store)

```bash
cd sellingpoint/mobile/android
./gradlew bundleRelease
```

On Windows:
```
cd sellingpoint\mobile\android
gradlew.bat bundleRelease
```

First build takes 10–20 minutes. Subsequent builds are 2–5 minutes.

Output file:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### 8.6 — Build the Release APK (for direct install / testing)

```bash
./gradlew assembleRelease
```

Output file:
```
android/app/build/outputs/apk/release/app-release.apk
```

You can share this APK directly via WhatsApp or email for testing before Play Store submission.

### 8.7 — Test the Release APK on a Real Device

Connect your Android phone via USB (with USB Debugging enabled), then:
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

Test:
- Log in with a real account
- Browse products
- Add to cart
- Complete a payment with a real card
- Confirm the order appears in the admin panel

---

## 9. SUBMIT TO GOOGLE PLAY STORE

### 9.1 — Create a Google Play Developer Account

Go to: https://play.google.com/console

- Sign in with a Google account
- Pay the one-time $25 registration fee
- Fill in your developer profile (name, address, etc.)
- Verify your identity (may require a government ID)

This takes 1–3 days to get approved.

### 9.2 — Prepare Required Assets

Before submitting, prepare these files:

| Asset | Size | Format | Notes |
|---|---|---|---|
| App icon | 512 × 512 px | PNG | No transparency, no rounded corners (Play Store rounds them) |
| Feature graphic | 1024 × 500 px | PNG or JPG | Shown at top of store listing |
| Phone screenshots | 1080 × 1920 px (min 2, max 8) | PNG or JPG | Take from a real phone or emulator |
| Privacy policy | — | Web URL | Required — host a page at yourdomain.com/privacy |

### 9.3 — Create the App in Play Console

1. Go to https://play.google.com/console
2. Click **Create app**
3. Fill in:
   - App name: `SellingPoint`
   - Default language: `English (United Kingdom)` or your preferred language
   - App type: `App`
   - Free or paid: `Free`
   - Declaration checkboxes: check both
4. Click **Create app**

### 9.4 — Complete the Store Listing

Go to **Store presence → Main store listing**:

- **App name**: SellingPoint
- **Short description** (max 80 chars): e.g. `Shop the best products with fast delivery across Nigeria`
- **Full description** (max 4000 chars): Describe your app, features, categories
- Upload your **app icon**, **feature graphic**, and **screenshots**
- Click **Save**

### 9.5 — Complete Required Sections

Play Console shows a dashboard with required sections. Complete each:

**App content** (Play Console → Policy → App content):
- Privacy policy: enter your privacy policy URL
- Ads: select "No, my app does not contain ads"
- Content rating: click **Start questionnaire** → select "Shopping" → answer questions → submit
- Target audience: select age 18+ or appropriate range
- Data safety: declare what data you collect (email, name, location for delivery, payment info)

**App access** (if the app requires login):
- Add instructions: email `customer@sellingpoint.com`, password `password`

### 9.6 — Upload the AAB

Go to **Release → Production → Create new release**:

1. Click **Upload** and select `app-release.aab`
2. Release name: `1.0` (or any label)
3. Release notes: `Initial release`
4. Click **Save** then **Review release**
5. Fix any warnings shown
6. Click **Start rollout to Production**

### 9.7 — Wait for Review

Google reviews new apps in 3–7 days. You will receive an email when approved or if rejected.

---

## 10. BUILD THE iOS APP

**Requirements:**
- A Mac computer running macOS 13 (Ventura) or later
- Xcode 15 or later (free from the Mac App Store)
- Apple Developer account ($99/year)
- iPhone or iPad for testing (optional but recommended)

### 10.1 — Sign Up for Apple Developer Program

Go to: https://developer.apple.com/programs/

- Sign in with your Apple ID
- Enroll as an Individual or Organization
- Pay the $99/year fee
- Approval takes 1–2 days

### 10.2 — Install Xcode

1. Open the Mac App Store
2. Search for **Xcode**
3. Click **Get** (it's free, ~15 GB download)
4. After install, open Xcode once to accept the license and install components

### 10.3 — Install CocoaPods

CocoaPods manages iOS native dependencies (like the equivalent of npm for iOS):

```bash
sudo gem install cocoapods
```

Or if you have Homebrew:
```bash
brew install cocoapods
```

Verify:
```bash
pod --version
```

### 10.4 — Install iOS Dependencies

```bash
cd sellingpoint/mobile
npm install
cd ios
pod install
cd ..
```

`pod install` downloads all the native iOS libraries. Takes 5–15 minutes on first run.

### 10.5 — Open the Project in Xcode

```bash
open ios/SellingPointTemp.xcworkspace
```

**Important:** Always open the `.xcworkspace` file, NOT the `.xcodeproj` file. The workspace includes all CocoaPods dependencies.

### 10.6 — Configure Signing in Xcode

In Xcode:

1. Click on the **SellingPointTemp** project in the left sidebar (the blue icon at the top)
2. Click the **SellingPointTemp** target (not the Tests target)
3. Click the **Signing & Capabilities** tab
4. Under **Team**, click the dropdown and sign in with your Apple ID
5. Select your developer team
6. Change the **Bundle Identifier** from `com.sellingpointtemp` to something unique you own, e.g., `com.yourcompany.sellingpoint`
7. Xcode will automatically create a provisioning profile

### 10.7 — Update the App Display Name

The default name `SellingPointTemp` needs to be changed.

In Xcode, find `Info.plist` in the left sidebar. Find `Bundle display name` and change it to `SellingPoint`.

Or edit the file directly:
```bash
nano ios/SellingPointTemp/Info.plist
```

Find and change:
```xml
<key>CFBundleDisplayName</key>
<string>SellingPoint</string>
```

### 10.8 — Set the Deployment Target

In Xcode → Project → General tab:
- Set **Minimum Deployments** to `iOS 13.0`

This ensures compatibility with devices running iOS 13 and later.

### 10.9 — Test on a Simulator

In Xcode, select a simulator from the top toolbar (e.g., "iPhone 15") and click the **Play button** (▶).

The app will build and launch in the simulator. Test the main flows.

### 10.10 — Test on a Real iPhone (Optional but Recommended)

1. Connect your iPhone via USB
2. On the iPhone: trust the computer when prompted
3. In Xcode: select your phone from the top toolbar instead of a simulator
4. Click the Play button (▶)
5. First time: on your iPhone go to **Settings → General → VPN & Device Management** → Trust your developer account

### 10.11 — Build for Release (Archive)

Make sure the correct signing is set up, then:

1. In Xcode, select **Any iOS Device (arm64)** from the device menu (not a simulator — you cannot archive with a simulator selected)
2. Go to **Product → Archive**
3. Xcode will build and archive the app. This takes 5–15 minutes.
4. The **Organizer** window opens automatically when done, showing your archive

---

## 11. SUBMIT TO APPLE APP STORE

### 11.1 — Create the App in App Store Connect

Go to: https://appstoreconnect.apple.com

1. Click **My Apps**
2. Click the **+** button → **New App**
3. Fill in:
   - Platform: iOS
   - Name: SellingPoint
   - Primary Language: English
   - Bundle ID: select the bundle ID you configured in Xcode
   - SKU: any unique identifier e.g. `SELLINGPOINT001`
4. Click **Create**

### 11.2 — Fill in App Information

**App Store → App Information:**
- Category: **Shopping**
- Subcategory: **Food & Drink** or whatever fits
- Privacy Policy URL: `https://yourdomain.com/privacy`
- Age Rating: complete the questionnaire (Shopping apps are typically 4+)

**App Store → Pricing and Availability:**
- Price: Free
- Availability: All countries (or select specific ones)

### 11.3 — Prepare Screenshots

Apple requires screenshots for every device size you support.

Required sizes (pixels):
- 6.7" display (iPhone 15 Pro Max): 1290 × 2796
- 6.5" display (iPhone 11 Pro Max / 12 / 13 / 14 Plus): 1242 × 2688
- 5.5" display (iPhone 8 Plus): 1242 × 2208
- iPad Pro 12.9": 2048 × 2732

Easiest way: take screenshots in the Xcode simulator for each size.

### 11.4 — Upload the Build from Xcode

Back in Xcode Organizer:

1. Select your archive
2. Click **Distribute App**
3. Select **App Store Connect**
4. Select **Upload**
5. Keep all defaults and click **Next** through the screens
6. Click **Upload**

The build uploads to App Store Connect. Takes 5–30 minutes.

### 11.5 — Add the Build to Your Submission

Back in App Store Connect:

1. Go to your app → **App Store** → select **1.0 Prepare for Submission**
2. Scroll to **Build** section → click **+** → select the build you just uploaded
3. Fill in:
   - **What's New in This Version**: "Initial release of SellingPoint"
   - Upload all screenshots for each device size
   - **App Preview** (video): optional
4. Click **Submit for Review**

### 11.6 — Wait for Review

Apple reviews apps in 24–72 hours for most apps. You will receive an email when approved or if they need changes.

---

## 12. AFTER LAUNCH — UPDATING THE APP

### Updating the Backend (no app update needed)

```bash
# SSH into your server
ssh deploy@YOUR_SERVER_IP
cd /var/www/sellingpoint/backend

# Pull latest code
git pull origin main

# Install any new packages
composer install --no-dev --optimize-autoloader

# Run new migrations
php artisan migrate --force

# Rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart queue workers
sudo supervisorctl restart sellingpoint-worker:*
```

### Changing the API URL (no app update needed)

Log in to Admin Panel → Settings → Environment → change the Production API URL → Save. The app picks it up on next launch automatically.

### Updating the Mobile App

1. Make your code changes
2. Increment `versionCode` and `versionName` in `android/app/build.gradle`
3. Run `./gradlew bundleRelease`
4. Upload the new AAB to Play Console → Create new release
5. For iOS: Archive in Xcode → Upload → submit in App Store Connect

---

## QUICK REFERENCE — COMMON COMMANDS

### Server Health Check
```bash
# Check Laravel logs
tail -f /var/www/sellingpoint/backend/storage/logs/laravel.log

# Check Nginx logs
tail -f /var/log/nginx/error.log

# Check queue workers
sudo supervisorctl status

# Restart everything
sudo systemctl reload nginx
sudo supervisorctl restart sellingpoint-worker:*
```

### Android Build Commands
```bash
cd sellingpoint/mobile/android

./gradlew bundleRelease        # AAB for Play Store
./gradlew assembleRelease      # APK for direct install
./gradlew assembleDebug        # Debug APK for testing
./gradlew clean                # Clean build artifacts (run before release)
```

### iOS Build Commands (Mac only)
```bash
cd sellingpoint/mobile
pod install                    # Install/update iOS dependencies (run after npm install)
open ios/SellingPointTemp.xcworkspace  # Open in Xcode
```

### Keystore Backup Reminder
```
sellingpoint/mobile/android/app/sellingpoint.keystore
```
Back this file up in multiple places. Losing it means you can never update the Play Store app.
