# Troubleshooting Guide

## Backend Issues

### Admin login shows "Access denied"
The `User` model must implement `FilamentUser` interface. Ensure the user has the `admin` role:
```bash
php artisan tinker
>>> App\Models\User::where('email', 'admin@sellingpoint.com')->first()->assignRole('admin');
```

### `Class BadgeColumn not found` error
This was a Filament v2 → v3 migration issue. All `BadgeColumn` calls have been replaced with `TextColumn->badge()` in this codebase.

### Migrations fail with FK constraint error
Run migrations in order — they are numbered to respect FK dependencies. If a migration fails:
```bash
php artisan migrate:fresh --seed
```

### `php artisan db:seed` fails
Ensure roles are seeded first. The `RoleSeeder` must run before `UserSeeder`:
```bash
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=UserSeeder
```

### Images not loading (404)
Create the storage symlink:
```bash
php artisan storage:link
```

### API returns 500 errors
Check the logs:
```bash
tail -f storage/logs/laravel.log
```

### CORS errors from mobile app
Ensure `config/cors.php` has `'allowed_origins' => ['*']` and the `HandleCors` middleware is registered in `bootstrap/app.php`.

---

## Mobile App Issues

### Metro bundler fails to start
```bash
cd mobile
npx react-native start --reset-cache
```

### Android build fails
```bash
cd mobile/android
./gradlew clean
cd ..
npx react-native run-android
```

### `JAVA_HOME` not found
Install JDK 17 and set:
```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin
```

### API calls fail on Android emulator
The emulator uses `10.0.2.2` to reach the host machine. Ensure:
```typescript
// src/constants/index.ts
export const API_BASE_URL = 'http://10.0.2.2:8000/api/v1';
```

### App crashes on startup
Check Metro logs for the actual error. Common causes:
- Missing `babel.config.js` (run `npx react-native init` in a fresh dir and copy it over)
- `react-native-reanimated/plugin` missing from `babel.config.js`
- Incorrect `GestureHandlerRootView` wrapping

### Cart badge not updating
The cart badge reads from Zustand `cartStore`. Ensure `fetchCart()` is called after add/remove operations.

---

## Paystack Issues

### Payment initialization fails
- Check `PAYSTACK_SECRET_KEY` in `.env` — must be the **secret** key, not the public key
- Ensure the order exists with `payment_status = 'unpaid'`
- Check Paystack dashboard for transaction logs

### Webhook not receiving events
- Ensure `POST /api/v1/payments/webhook` is publicly accessible (not behind auth)
- Register the webhook URL in Paystack Dashboard → Settings → API Keys & Webhooks
- Check the `X-Paystack-Signature` header is being sent

### "Invalid signature" webhook error
The `PAYSTACK_SECRET_KEY` in `.env` must match the one registered in Paystack dashboard.

---

## OneSignal Issues

### Push notifications not received
- Ensure `ONESIGNAL_APP_ID` and `ONESIGNAL_API_KEY` are set in `.env`
- Check that the device registered its player ID via `POST /api/v1/notifications/push-token`
- Verify in OneSignal dashboard under **Audience → All Users**

### Player ID not saved
The mobile app sends `{ token: playerId, platform: 'android' }` to the backend. The `PushToken` model stores it in the `player_id` column.

---

## Production Deployment Issues

### `composer install` fails with package not found
The package `laravel/pao` was an invalid entry — it has been removed. Run `composer install` again.

### Queue jobs not running
```bash
php artisan queue:work --sleep=3 --tries=3 --daemon
# Or via Supervisor (recommended for production)
```

### App in maintenance mode after deploy
```bash
php artisan up
```
