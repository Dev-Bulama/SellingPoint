# Production Go-Live Checklist

Use this checklist before launching Sellingpoint to real customers. Work through each section in order — earlier sections must be completed before later ones make sense.

Mark each item with [x] when completed.

---

## Section 1: Server and Infrastructure

These are the foundational requirements. Nothing else works without these.

- [ ] VPS provisioned with Ubuntu 22.04 (minimum 2 vCPU, 4 GB RAM, 80 GB SSD)
- [ ] SSH access working with a non-root user
- [ ] Server fully updated (`sudo apt update && sudo apt upgrade -y`)
- [ ] PHP 8.2-FPM installed with all required extensions (mysql, mbstring, xml, curl, gd, zip, bcmath, intl)
- [ ] MySQL 8 installed and secured (`mysql_secure_installation` run)
- [ ] Production database created with a dedicated database user (not root)
- [ ] Nginx installed and running
- [ ] Composer installed
- [ ] Git installed

---

## Section 2: Application Deployment

- [ ] Repository cloned to `/var/www/sellingpoint`
- [ ] Composer dependencies installed with `--no-dev --optimize-autoloader`
- [ ] `.env` file created from `.env.example`
- [ ] `APP_ENV=production` set in `.env`
- [ ] `APP_DEBUG=false` set in `.env` (CRITICAL — debug mode exposes secrets to users)
- [ ] `APP_URL` set to the HTTPS domain (e.g., `https://api.yourdomain.com`)
- [ ] `APP_KEY` generated (`php artisan key:generate`)
- [ ] Database credentials in `.env` correct and tested
- [ ] `php artisan migrate --force` run successfully
- [ ] `php artisan db:seed --force` run (or skipped if you don't want demo data)
- [ ] `php artisan storage:link` run (images must be accessible)
- [ ] Production caches built: `php artisan config:cache && php artisan route:cache && php artisan view:cache`
- [ ] File permissions set: `storage/` and `bootstrap/cache/` writable by `www-data`

---

## Section 3: Web Server and SSL

- [ ] Nginx site configuration created for your domain
- [ ] Nginx configuration tested (`sudo nginx -t` shows "syntax is ok")
- [ ] Nginx reloaded after config change
- [ ] DNS A record created: `api.yourdomain.com` → server IP
- [ ] DNS propagated (test with `nslookup api.yourdomain.com` or https://dnschecker.org)
- [ ] Certbot installed and SSL certificate issued for your domain
- [ ] HTTPS working: `https://api.yourdomain.com` returns a response (not a browser warning)
- [ ] HTTP redirects to HTTPS automatically
- [ ] Certbot auto-renewal tested (`sudo certbot renew --dry-run` succeeds)

---

## Section 4: Backend Security

- [ ] `APP_DEBUG=false` (second check — this is critical)
- [ ] `.env` file is not publicly accessible (verify: `curl https://api.yourdomain.com/.env` returns 403 or 404)
- [ ] Default admin password changed from `password` to a strong unique password
- [ ] Strong database password set (not empty, not "password")
- [ ] No test or debug routes exposed in production
- [ ] `LOG_LEVEL=error` in `.env` (avoid logging sensitive data in production)
- [ ] Rate limiting is active (check the `throttle` middleware is applied in routes)

---

## Section 5: Payment Setup (Paystack)

- [ ] Paystack business account verified (KYC completed)
- [ ] Bank account added for settlements
- [ ] Live Paystack keys obtained from Paystack dashboard
- [ ] `PAYSTACK_SECRET_KEY` set to the live key (`sk_live_...`) in `.env`
- [ ] `PAYSTACK_PUBLIC_KEY` set to the live key (`pk_live_...`) in `.env`
- [ ] Webhook URL registered in Paystack dashboard: `https://api.yourdomain.com/api/v1/payments/webhook`
- [ ] Webhook tested: make a small real transaction (e.g., ₦100) and confirm:
  - Payment is processed
  - Order status changes to "processing"
  - Payment status changes to "paid"
- [ ] Test card numbers are REMOVED from any documentation shown to customers (test cards do not work in live mode)

---

## Section 6: Push Notifications (OneSignal)

If push notifications are required at launch:

- [ ] OneSignal account created
- [ ] OneSignal app configured with Firebase FCM
- [ ] `ONESIGNAL_APP_ID` set in `.env`
- [ ] `ONESIGNAL_API_KEY` set in `.env`
- [ ] Queue worker running (Supervisor started)
- [ ] Test notification sent from OneSignal dashboard to a real device
- [ ] Order status change triggers a push notification successfully

If push notifications are not required at launch:

- [ ] Confirmed the app works without OneSignal configured (it should — this is optional)

---

## Section 7: Queue Worker

The queue worker handles background tasks: email sending, push notifications, etc. Without it, these features silently fail.

- [ ] Supervisor installed (`sudo apt install supervisor`)
- [ ] Supervisor config created at `/etc/supervisor/conf.d/sellingpoint-worker.conf`
- [ ] Queue workers started (`sudo supervisorctl start sellingpoint-worker:*`)
- [ ] Workers showing `RUNNING` status (`sudo supervisorctl status`)
- [ ] Worker log file exists and has no errors (`/var/log/sellingpoint-worker.log`)
- [ ] Supervisor set to start on system boot (`sudo systemctl enable supervisor`)

---

## Section 8: Mobile App Build

- [ ] `API_BASE_URL` in `mobile/src/constants/index.ts` points to the production HTTPS URL
- [ ] Production URL is HTTPS (not HTTP — Android blocks HTTP by default)
- [ ] OneSignal App ID in mobile constants is correct (if using notifications)
- [ ] `google-services.json` is present in `mobile/android/app/` (if using notifications)
- [ ] Release keystore generated and backed up in at least 2 locations
- [ ] Keystore password saved securely (password manager or equivalent)
- [ ] `versionCode` and `versionName` updated in `android/app/build.gradle`
- [ ] Release AAB built: `./gradlew bundleRelease`
- [ ] Release AAB tested by installing on a real device
- [ ] App connects to production API (log in, browse products, add to cart)
- [ ] Payment flow tested end-to-end on the production backend with a real card
- [ ] Push notifications received on the test device (if configured)

---

## Section 9: Play Store Submission

- [ ] Google Play Developer account created ($25 one-time fee)
- [ ] App icon (512 x 512 PNG) prepared
- [ ] Feature graphic (1024 x 500 PNG) prepared
- [ ] At least 2 phone screenshots captured
- [ ] Short description written (max 80 characters)
- [ ] Full description written (max 4000 characters)
- [ ] Privacy policy page published and URL available
- [ ] Data safety form completed in Play Console (what data the app collects)
- [ ] Content rating questionnaire completed
- [ ] Target SDK level 34 set in `build.gradle`
- [ ] AAB uploaded to Play Console
- [ ] Release reviewed and submitted

---

## Section 10: Monitoring

After launch, set up monitoring to know when things break before your customers report them:

- [ ] Set up uptime monitoring (free options: UptimeRobot, Better Uptime — monitors your API URL every 5 minutes and alerts you if it goes down)
- [ ] Configure email alerts for Laravel errors (set `LOG_CHANNEL=slack` or use a service like Bugsnag/Sentry — optional but recommended)
- [ ] Set up a monitoring email: if the app goes down, who gets the alert and how quickly can they respond?
- [ ] Verify Laravel logs are not filling up disk space (`storage/logs/laravel.log` rotation configured)

---

## Section 11: Backup

Data loss is permanent. Set up backups before you have real customer data.

- [ ] MySQL automated backups configured (cron job or VPS provider's backup feature)
- [ ] Test backup restore: can you actually restore from a backup?
- [ ] Storage folder backed up (product images, user avatars)
- [ ] Backup schedule documented (daily minimum)
- [ ] Backup retention policy set (keep at least 7 days of backups)

Simple MySQL backup cron (add to `crontab -e`):
```bash
0 2 * * * mysqldump -u sellingpoint -pPASSWORD sellingpoint | gzip > /backups/sellingpoint-$(date +\%Y\%m\%d).sql.gz
```

---

## Final Verification: Smoke Test

Before announcing your launch, manually test the complete customer journey:

- [ ] Register a new account in the app
- [ ] Browse product categories
- [ ] Search for a product
- [ ] View a product detail page
- [ ] Add a product to cart
- [ ] Add a delivery address
- [ ] Apply a coupon code (if you have one set up)
- [ ] Place an order with a real card
- [ ] Receive the order confirmation push notification
- [ ] Log in to admin panel and see the order
- [ ] Update order status to "Processing"
- [ ] Confirm the customer receives the status update notification
- [ ] Update order status to "Shipped"
- [ ] Customer can view order tracking in the app

If every step works, you are ready to launch.

---

## Emergency Contacts

Fill this in before launching:

| Role | Name | Contact | Response Time |
|------|------|---------|---------------|
| Developer | — | — | — |
| Server/Hosting | — | Support URL | — |
| Paystack Support | — | support@paystack.com | Business hours |
| OneSignal Support | — | support@onesignal.com | Business hours |

---

## Rollback Plan

If something goes wrong after launch:

```bash
# On the server — rollback to previous git commit
cd /var/www/sellingpoint/backend
git log --oneline -5          # Find the previous good commit hash
git checkout COMMIT_HASH       # Or: git reset --hard COMMIT_HASH

# Re-run setup
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
sudo supervisorctl restart sellingpoint-worker:*
```

For database rollback (use with caution — this deletes data added since the last migration):
```bash
php artisan migrate:rollback --step=1
```
