# System Requirements

This page lists everything you need to install before you can run Sellingpoint on your computer. Read through the entire list first, then follow the setup guides linked at the bottom.

---

## Quick Checklist

- [ ] PHP 8.2 or higher
- [ ] Composer 2.x
- [ ] MySQL 8.0 or higher
- [ ] Node.js 18 or higher
- [ ] npm (comes with Node.js)
- [ ] Java JDK 17 (for Android development)
- [ ] Android Studio (for Android development)
- [ ] Git
- [ ] Paystack account (free to create)
- [ ] OneSignal account (optional — for push notifications)
- [ ] At least 8 GB RAM
- [ ] At least 50 GB free disk space

---

## 1. PHP 8.2+

PHP is the programming language the Laravel backend runs on. You need version 8.2 or newer.

**How to check if you have it:**
```bash
php -v
```

Expected output (version number must start with 8.2 or higher):
```
PHP 8.2.x (cli) ...
```

**How to install:**

- **Windows (easiest):** Install XAMPP from https://www.apachefriends.org — it bundles PHP, Apache, and MySQL together. Choose the version that includes PHP 8.2+.
- **Mac:** Use Homebrew: `brew install php@8.2`
- **Ubuntu/Debian:** `sudo apt install php8.2 php8.2-cli php8.2-mbstring php8.2-xml php8.2-mysql php8.2-curl php8.2-gd php8.2-zip php8.2-bcmath`

**Required PHP extensions** (XAMPP includes all of these):
- `pdo_mysql` — database connection
- `mbstring` — string handling
- `xml` — XML processing
- `gd` — image manipulation
- `zip` — archive handling
- `bcmath` — precise math for payments
- `curl` — HTTP requests (Paystack, OneSignal)
- `intl` — internationalization

---

## 2. Composer 2.x

Composer is PHP's package manager — it downloads and manages all the PHP libraries your project needs (think of it like `npm` but for PHP).

**How to check if you have it:**
```bash
composer --version
```

Expected output:
```
Composer version 2.x.x ...
```

**How to install:**

- **Windows:** Download and run the installer from https://getcomposer.org/Composer-Setup.exe — it guides you through the installation and adds Composer to your PATH automatically.
- **Mac/Linux:** Run this in your terminal:
  ```bash
  curl -sS https://getcomposer.org/installer | php
  sudo mv composer.phar /usr/local/bin/composer
  ```

If Composer is installed but showing version 1.x, upgrade it:
```bash
composer self-update
```

---

## 3. MySQL 8.0+

MySQL is the database where all your store data is stored — products, orders, customers, etc.

**How to check if you have it:**
```bash
mysql --version
```

Expected output:
```
mysql  Ver 8.x.x ...
```

**How to install:**

**Option A — XAMPP (Windows, recommended for beginners):**
1. Download XAMPP from https://www.apachefriends.org
2. Install it (default settings are fine)
3. Open the XAMPP Control Panel
4. Start the **Apache** and **MySQL** modules by clicking their Start buttons
5. MySQL is now running and accessible at `127.0.0.1:3306`
6. phpMyAdmin (the visual database manager) is at http://localhost/phpmyadmin

**Option B — MySQL standalone:**
- Windows: Download MySQL Installer from https://dev.mysql.com/downloads/installer/
- Mac: `brew install mysql@8.0`
- Ubuntu: `sudo apt install mysql-server`

**Default credentials with XAMPP:**
- Host: `127.0.0.1`
- Port: `3306`
- Username: `root`
- Password: *(empty — no password)*

---

## 4. Node.js 18+

Node.js is the runtime for the React Native mobile app. You need it to install packages and run the Metro bundler (the development server for React Native).

**How to check if you have it:**
```bash
node --version
```

Expected output:
```
v18.x.x   (or v20.x.x, v22.x.x — any v18 or higher is fine)
```

**How to install:**
1. Go to https://nodejs.org
2. Click the **LTS** (Long Term Support) button — this is the recommended version
3. Download the installer for your operating system
4. Run the installer with default settings
5. Restart your terminal after installation

> Avoid odd-numbered versions like v17 or v19 — they are development releases and may have bugs. Use the LTS version (even numbers: v18, v20, v22).

---

## 5. npm

npm (Node Package Manager) is automatically installed alongside Node.js. You do not need to install it separately.

**How to verify:**
```bash
npm --version
```

You should see a version number like `10.x.x`. If this command fails, your Node.js installation may be corrupted — reinstall Node.js.

---

## 6. Java JDK 17

Java is required to compile and build the Android app. You need JDK 17 specifically (Android build tools require this version).

**How to check if you have it:**
```bash
java -version
```

Expected output should mention version 17:
```
openjdk version "17.x.x" ...
```

**How to install:**
1. Go to https://adoptium.net (Eclipse Temurin — free, open-source JDK)
2. Select **Temurin 17 (LTS)** from the version dropdown
3. Select your operating system
4. Download and run the installer

**After installing, set the JAVA_HOME environment variable:**

- **Windows:**
  1. Search for "Environment Variables" in the Start menu
  2. Click "Edit the system environment variables"
  3. Click "Environment Variables" button
  4. Under "System variables", click "New"
  5. Variable name: `JAVA_HOME`
  6. Variable value: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot` (your actual install path)
  7. Find the `Path` variable, click Edit, click New, and add: `%JAVA_HOME%\bin`

- **Mac/Linux (add to ~/.bashrc or ~/.zshrc):**
  ```bash
  export JAVA_HOME=$(/usr/libexec/java_home -v 17)
  export PATH=$PATH:$JAVA_HOME/bin
  ```
  Then run: `source ~/.bashrc` (or `source ~/.zshrc`)

---

## 7. Android Studio

Android Studio is the official IDE for Android development. You need it for its Android SDK tools, emulator, and build tools — even if you do not write code in it.

**How to install:**
1. Go to https://developer.android.com/studio
2. Click "Download Android Studio"
3. Run the installer with default settings
4. On first launch, complete the Setup Wizard:
   - Select "Standard" install type
   - Let it download the Android SDK (this takes 5–10 minutes and uses ~2 GB)

**Why you need it even if you are not using Android Studio as your editor:**
Android Studio installs the Android SDK, which contains:
- Build tools for compiling the app
- Platform tools (adb — Android Debug Bridge)
- The system images needed to run the emulator

**Required disk space:** Android Studio + SDK requires approximately 10–15 GB of disk space.

---

## 8. Git

Git is the version control tool you use to download (clone) the project.

**How to check if you have it:**
```bash
git --version
```

**How to install:**
- **Windows:** Download from https://git-scm.com/download/win — use default settings
- **Mac:** Run `git --version` in Terminal — macOS will prompt you to install Xcode Command Line Tools, which includes Git
- **Ubuntu:** `sudo apt install git`

---

## 9. Paystack Account

Paystack is the payment gateway used for accepting card payments. You need a free Paystack account to get API keys.

**Test environment (development):**
- You can use Paystack test keys without any verification
- Test keys start with `sk_test_` and `pk_test_`
- No real money moves in test mode
- Create account at: https://paystack.com

**Live environment (production):**
- Live keys start with `sk_live_` and `pk_live_`
- Requires a verified business account
- Paystack currently supports businesses in Nigeria, Ghana, Kenya, South Africa, and Egypt

**For development purposes**, test keys are sufficient. You can start building and testing payments immediately after creating an account.

---

## 10. OneSignal Account (Optional)

OneSignal handles push notifications — the alerts customers receive when their order ships or is delivered.

**This is optional for development.** You can run the entire app and backend without OneSignal configured. Push notifications simply will not be sent.

**To set up push notifications:**
- Create a free account at https://onesignal.com
- See the [OneSignal Guide](ONESIGNAL-GUIDE.md) for full setup steps

---

## 11. Hardware Requirements

### Minimum
| Resource | Minimum |
|----------|---------|
| RAM | 8 GB |
| Free Disk Space | 50 GB |
| CPU | 4 cores |
| OS | Windows 10, macOS 12+, or Ubuntu 20.04+ |

### Recommended
| Resource | Recommended |
|----------|------------|
| RAM | 16 GB |
| Free Disk Space | 100 GB SSD |
| CPU | 8 cores |

**Why so much disk space?**
- Android Studio: ~1 GB
- Android SDK: ~10–15 GB
- Android Emulator system images: ~2–4 GB each
- Node.js dependencies (`node_modules`): ~500 MB–1 GB
- PHP dependencies (`vendor`): ~100–200 MB
- MySQL data: variable

**Why so much RAM?**
Running the backend, the Android emulator, and Metro bundler simultaneously requires significant memory. The emulator alone uses 2–4 GB of RAM. With 8 GB you can run everything, but 16 GB is much more comfortable.

---

## Summary Table

| Requirement | Minimum Version | Where to Get | Check Command |
|-------------|----------------|--------------|---------------|
| PHP | 8.2 | apachefriends.org (XAMPP) | `php -v` |
| Composer | 2.x | getcomposer.org | `composer --version` |
| MySQL | 8.0 | Included in XAMPP | `mysql --version` |
| Node.js | 18 LTS | nodejs.org | `node --version` |
| npm | 10.x | Bundled with Node.js | `npm --version` |
| Java JDK | 17 | adoptium.net | `java -version` |
| Android Studio | Latest | developer.android.com/studio | (visual check) |
| Git | Any | git-scm.com | `git --version` |

---

## Next Step

Once you have all requirements installed, continue to:

- [Backend Setup Guide](BACKEND-SETUP.md) — Get the Laravel API running
- [Mobile Setup Guide](MOBILE-SETUP.md) — Get the React Native app running
