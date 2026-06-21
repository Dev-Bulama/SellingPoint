# Backend Setup Guide

This guide walks you through setting up the Laravel backend from a fresh computer to a running API server. Follow each step in order — do not skip ahead.

**Before you start:** Make sure you have completed [REQUIREMENTS.md](REQUIREMENTS.md) and have PHP 8.2+, Composer, MySQL, and Git installed.

**Time required:** Approximately 20–30 minutes on a good internet connection.

---

## Step 1: Install XAMPP (Windows Users)

XAMPP gives you PHP, Apache (web server), and MySQL in a single installer — the easiest way to get a development environment on Windows.

1. Go to https://www.apachefriends.org
2. Click **Download** for Windows
3. Run the installer (allow administrator permissions if prompted)
4. When selecting components, make sure **Apache**, **MySQL**, and **PHP** are checked (they are by default)
5. Install to the default location (`C:\xampp`)
6. After installation, open the **XAMPP Control Panel** from your Start menu
7. Click **Start** next to **Apache**
8. Click **Start** next to **MySQL**
9. Both should show a green background when running

**Verify PHP is available in your terminal:**

Open a new Command Prompt or PowerShell window and run:
```bash
php -v
```

If you see "php is not recognized", add PHP to your PATH:
1. Search for "Environment Variables" in Start menu
2. Edit the `Path` system variable
3. Add: `C:\xampp\php`
4. Restart your terminal

**Mac users:** You likely already have PHP or can install it with `brew install php@8.2`. MySQL can be installed with `brew install mysql` or via XAMPP for Mac.

---

## Step 2: Install Composer

Composer is the PHP package manager that will download all the project's dependencies.

**Windows:**
1. Download from https://getcomposer.org/Composer-Setup.exe
2. Run the installer
3. When prompted for the PHP executable, point it to `C:\xampp\php\php.exe`
4. Complete the installation

**Mac/Linux:**
```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

**Verify:**
```bash
composer --version
```

You should see `Composer version 2.x.x`. If you see version 1.x, run `composer self-update` to upgrade.

---

## Step 3: Get the Project Code

Open a terminal (Command Prompt on Windows, Terminal on Mac/Linux) and run:

```bash
git clone https://github.com/dev-bulama/sellingpoint.git
```

This downloads the entire project to a folder called `sellingpoint` in your current directory.

Now navigate into the backend folder:
```bash
cd sellingpoint/backend
```

All remaining commands in this guide should be run from inside the `backend/` folder.

---

## Step 4: Install PHP Dependencies

```bash
composer install
```

This command reads `composer.json` and downloads all the PHP packages the project depends on (Laravel, Filament, Paystack SDK, etc.). They are saved into a `vendor/` folder.

**What to expect:**
- This may take 2–5 minutes on first run
- You will see package names scrolling as they download
- At the end you should see: `Package operations: X installs, 0 updates, 0 removals`

**If you see errors about PHP extensions**, check that your PHP installation includes the required extensions (see [REQUIREMENTS.md](REQUIREMENTS.md)).

---

## Step 5: Environment Setup

The `.env` file contains your configuration — database credentials, API keys, app settings. It is intentionally not included in the repository (it contains secrets).

Copy the template:
```bash
cp .env.example .env
```

On Windows (Command Prompt):
```
copy .env.example .env
```

Now open `.env` in a text editor (Notepad, VS Code, etc.) and configure each section:

### Application Settings
```env
APP_NAME=Sellingpoint          # Your store name — shows in emails and admin panel
APP_ENV=local                  # "local" for development, "production" for live server
APP_KEY=                       # Leave blank — we will generate this in Step 6
APP_DEBUG=true                 # Shows detailed error pages — set to false in production
APP_URL=http://localhost:8000  # The URL where your backend runs
```

### Database Settings
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1              # Always 127.0.0.1 for local development
DB_PORT=3306                   # Default MySQL port — leave unchanged
DB_DATABASE=sellingpoint       # Must match the database name you create in Step 7
DB_USERNAME=root               # XAMPP default — change if you set a MySQL password
DB_PASSWORD=                   # XAMPP default has no password — leave blank
```

### Queue and Cache
```env
QUEUE_CONNECTION=database      # Stores background jobs in MySQL — fine for development
CACHE_STORE=database           # Stores cache in MySQL — fine for development
SESSION_DRIVER=database        # Stores sessions in MySQL
```

### Mail (for development, keep as-is)
```env
MAIL_MAILER=log                # Writes emails to log file instead of sending — perfect for dev
MAIL_FROM_ADDRESS="noreply@sellingpoint.com"
```

### Paystack (Payment Gateway)
```env
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here   # Get from dashboard.paystack.com
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here   # Get from dashboard.paystack.com
```
- Test keys start with `sk_test_` and `pk_test_`
- Live keys start with `sk_live_` and `pk_live_`
- For development, always use test keys
- See [PAYMENT-GUIDE.md](PAYMENT-GUIDE.md) for how to get these keys

### OneSignal (Push Notifications — optional)
```env
ONESIGNAL_APP_ID=your-onesignal-app-id
ONESIGNAL_API_KEY=your-onesignal-rest-api-key
```
You can leave these as the placeholder values for now. The app will work without them — push notifications just will not be sent. See [ONESIGNAL-GUIDE.md](ONESIGNAL-GUIDE.md) when you are ready to set this up.

---

## Step 6: Generate Application Key

Laravel uses a secret key to encrypt sessions, tokens, and other sensitive data. Generate it with:

```bash
php artisan key:generate
```

This automatically fills in the `APP_KEY` value in your `.env` file. You should see:

```
INFO  Application key set successfully.
```

> Never share your `APP_KEY`. Never commit `.env` to Git. Each deployment should have its own unique key.

---

## Step 7: Create the Database

You need to create an empty MySQL database that Laravel will populate in the next step.

**Using phpMyAdmin (recommended for beginners):**

1. Open your browser and go to: http://localhost/phpmyadmin
2. Click **New** in the left sidebar
3. In the "Database name" field, type: `sellingpoint`
4. Set Collation to: `utf8mb4_unicode_ci`
5. Click **Create**

The database name must exactly match the `DB_DATABASE` value in your `.env` file.

**Using the MySQL command line (alternative):**
```bash
mysql -u root -p
```
Then in the MySQL prompt:
```sql
CREATE DATABASE sellingpoint CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

---

## Step 8: Run Database Migrations

Migrations create all the database tables. Laravel reads the migration files in `database/migrations/` and creates the tables in the order they are defined.

```bash
php artisan migrate
```

**What to expect:**
- Each migration file runs once
- You will see each table being created: `INFO Creating migration table` ... `DONE`
- Tables created include: users, products, orders, cart_items, addresses, reviews, notifications, etc.

**If you see a connection error** like `SQLSTATE[HY000] [2002] Connection refused`:
- Check that MySQL is running in the XAMPP Control Panel
- Check your `DB_HOST`, `DB_PORT`, `DB_USERNAME`, and `DB_PASSWORD` in `.env`

---

## Step 9: Seed Demo Data

Seeders populate the database with sample data so you can immediately see the app working — demo products, categories, brands, a test admin user, and a test customer.

```bash
php artisan db:seed
```

**What the seeders create:**
| Seeder | What it creates |
|--------|----------------|
| RoleSeeder | User roles (admin, customer) |
| UserSeeder | Admin and customer demo accounts |
| CategorySeeder | ~10 product categories (Electronics, Fashion, etc.) |
| BrandSeeder | ~15 product brands |
| ProductSeeder | ~50 sample products with prices and stock |
| BannerSeeder | Homepage promotional banners |
| CouponSeeder | Sample discount codes |
| ShippingZoneSeeder | Shipping zones and rates |
| PageSeeder | About, Privacy Policy, Terms pages |
| FaqSeeder | Frequently asked questions |
| SettingSeeder | Default store settings |

This takes about 30–60 seconds to complete.

---

## Step 10: Create Storage Link

The app stores uploaded images in `storage/app/public/`. This command creates a symbolic link so they are accessible via the web at `/storage/...`.

```bash
php artisan storage:link
```

You should see:
```
INFO  The [public/storage] link has been connected to [storage/app/public].
```

---

## Step 11: Start the Development Server

```bash
php artisan serve
```

You should see:
```
INFO  Server running on [http://127.0.0.1:8000].

Press Ctrl+C to stop the server
```

The backend is now running. Leave this terminal window open — closing it will stop the server.

---

## Step 12: Test the API

Open your browser and go to:

```
http://localhost:8000/api/v1/products
```

You should see a JSON response with product data, something like:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Sample Product",
      "slug": "sample-product",
      "price": 15000,
      ...
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 50,
    ...
  }
}
```

If you see this, your backend is working correctly.

**Other endpoints to test:**
- http://localhost:8000/api/v1/categories — list of categories
- http://localhost:8000/api/v1/brands — list of brands
- http://localhost:8000/api/v1/products/featured — featured products

---

## Step 13: Access the Admin Panel

Open your browser and go to:
```
http://localhost:8000/admin
```

Log in with the demo admin credentials:
- **Email:** admin@sellingpoint.com
- **Password:** password

You should see the Filament dashboard with widgets showing demo orders, revenue, and products.

See [ADMIN-GUIDE.md](ADMIN-GUIDE.md) for a full walkthrough of the admin panel.

---

## Step 14: Run the Queue Worker (Optional for Development)

The queue worker processes background jobs like sending emails and push notifications. For development, you can run it manually:

```bash
php artisan queue:work
```

Open this in a **second terminal window** alongside `php artisan serve`. The queue worker runs until you stop it with Ctrl+C.

Without the queue worker running, jobs (emails, push notifications) get queued but not processed. For basic development and testing, this is fine — the app still works, notifications just do not send in real time.

---

## Common Problems

### "Could not find driver" / PDO MySQL error
Your PHP installation is missing the MySQL extension.
- XAMPP: Make sure MySQL module is started
- Ubuntu: Run `sudo apt install php8.2-mysql`

### "Class not found" after composer install
Run: `composer dump-autoload`

### "php artisan key:generate" fails
Make sure you copied `.env.example` to `.env` first (Step 5).

### Migrations fail with "Table already exists"
If you ran migrations before, they may partially complete. Run:
```bash
php artisan migrate:fresh --seed
```
Warning: This drops all tables and re-creates them. Only use this during development.

### phpMyAdmin not loading
Make sure Apache is started in the XAMPP Control Panel, not just MySQL.

### Port 8000 already in use
Run on a different port:
```bash
php artisan serve --port=8080
```
Then update `APP_URL=http://localhost:8080` in your `.env`.

---

## What You Have Now

After completing all steps:

| URL | What It Is |
|-----|-----------|
| http://localhost:8000 | Laravel backend root |
| http://localhost:8000/api/v1/products | REST API |
| http://localhost:8000/admin | Filament admin panel |
| http://localhost/phpmyadmin | Database management |

Continue to:
- [Mobile Setup Guide](MOBILE-SETUP.md) — Set up the React Native app
- [Admin Guide](ADMIN-GUIDE.md) — Learn the admin panel
