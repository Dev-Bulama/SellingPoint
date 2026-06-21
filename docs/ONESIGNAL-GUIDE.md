# OneSignal Push Notifications Guide

This guide walks you through setting up OneSignal push notifications for Sellingpoint — from creating your account to testing notifications on a real device.

---

## What Are Push Notifications Used For?

In Sellingpoint, push notifications are sent automatically when:

| Event | Notification Example |
|-------|---------------------|
| Order confirmed | "Your order SP123 has been confirmed!" |
| Order shipped | "Your order SP123 is on its way!" |
| Order delivered | "Your order SP123 has been delivered!" |
| Order cancelled | "Your order SP123 was cancelled." |
| Promotional | "Flash sale: 20% off all electronics today!" |
| System message | "Scheduled maintenance tonight at 11PM" |

Push notifications are optional — the app functions normally without them. You can add this setup at any time.

---

## Overview of How It Works

```
Customer Device (React Native App)
        |
        | App registers with OneSignal
        | OneSignal returns a "Player ID" (unique device identifier)
        |
        v
Sellingpoint Backend
        | App saves Player ID to backend: POST /api/v1/notifications/push-token
        |
        v
When order status changes:
        | Backend looks up customer's Player ID
        | Backend sends notification via OneSignal REST API
        |
        v
OneSignal servers deliver the notification to the device
        |
        v
Customer sees the notification
```

---

## Step 1: Create a OneSignal Account

1. Go to https://onesignal.com
2. Click **Sign Up Free**
3. Fill in your name, email, and password
4. Verify your email address
5. You will land on the OneSignal dashboard

---

## Step 2: Create a New App

1. In the OneSignal dashboard, click **New App/Website**
2. Enter a name for your app: `Sellingpoint` (or your store name)
3. Select **Mobile Push** as the platform
4. Click **Next**

---

## Step 3: Configure Firebase FCM for Android

OneSignal uses Firebase Cloud Messaging (FCM) to deliver notifications to Android devices. You need to connect your Firebase project to OneSignal.

### 3a: Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Create a project**
3. Enter project name: `sellingpoint` (or your store name)
4. Disable Google Analytics (not needed for push notifications) or leave it enabled — your choice
5. Click **Create project**
6. Wait for the project to be created, then click **Continue**

### 3b: Get the Firebase Server Key

1. In the Firebase console, click the gear icon next to "Project Overview"
2. Click **Project settings**
3. Click the **Cloud Messaging** tab
4. Find the **Server key** under "Cloud Messaging API (Legacy)"
   - If you see "Firebase Cloud Messaging API (V1)" section instead, you need to use the new method. Click **Manage API in Google Cloud Console** and enable the API.
5. Copy the **Server key** (a long string of letters and numbers)

### 3c: Add Firebase to OneSignal

1. Back in OneSignal's setup, select **Google Android (FCM)**
2. Paste your **Firebase Server Key**
3. Click **Save & Continue**

---

## Step 4: Get Your OneSignal App ID and REST API Key

After configuring FCM, OneSignal shows you your app credentials:

1. Click **Done** on the platform setup
2. Go to your OneSignal dashboard → click your app name
3. Click **Settings** in the left sidebar
4. Click **Keys & IDs**
5. Copy:
   - **OneSignal App ID** — looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
   - **REST API Key** — a long alphanumeric string

Keep these private. The REST API Key can send notifications to any subscriber.

---

## Step 5: Configure the Backend

Open `sellingpoint/backend/.env` and add your credentials:

```env
ONESIGNAL_APP_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
ONESIGNAL_API_KEY=your-rest-api-key-here
```

You can also configure these in the admin panel: **Configuration → Settings → OneSignal tab**.

After editing `.env`, clear the config cache:
```bash
php artisan config:clear
```

---

## Step 6: Add Firebase to the Android App

The mobile app needs a `google-services.json` file to connect to your Firebase project.

1. In the Firebase console, go to **Project settings**
2. Under **Your apps**, click the Android icon (add Android app if you haven't)
3. Register your app:
   - Android package name: find it in `mobile/android/app/build.gradle` as `applicationId` (e.g., `com.sellingpoint`)
   - App nickname: `Sellingpoint`
4. Click **Register app**
5. Download the `google-services.json` file
6. Copy it to: `sellingpoint/mobile/android/app/google-services.json`

Without this file, the app will crash on startup when OneSignal is initialized.

---

## Step 7: Configure the Mobile App

### Install OneSignal React Native SDK

```bash
cd sellingpoint/mobile
npm install react-native-onesignal
```

### Initialize OneSignal in the App

Find the main app file (likely `mobile/src/App.tsx` or `mobile/index.js`) and add:

```typescript
import OneSignal from 'react-native-onesignal';
import { API_BASE_URL, ONESIGNAL_APP_ID } from './src/constants';

// Initialize OneSignal
OneSignal.setAppId(ONESIGNAL_APP_ID);

// Prompt for notification permission (iOS — optional on Android)
OneSignal.promptForPushNotificationsWithUserResponse();

// Listen for subscription changes and save the player ID to backend
OneSignal.addSubscriptionObserver(event => {
  if (event.to.isSubscribed && event.to.userId) {
    // Save the OneSignal player ID to your backend
    fetch(`${API_BASE_URL}/notifications/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        token: event.to.userId,
        platform: 'android',
      }),
    });
  }
});
```

### Add the App ID to Constants

Open `mobile/src/constants/index.ts` and add:
```typescript
export const ONESIGNAL_APP_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
```

---

## Step 8: Test Push Notifications from Dashboard

After completing the setup and running the app on a device:

1. Open the OneSignal dashboard
2. Click your app
3. Click **Messages** in the left sidebar
4. Click **New Push**
5. Select **Send to Test Device**
6. In the message composer:
   - **Title:** `Test Notification`
   - **Message:** `Hello from Sellingpoint!`
7. Click **Send Test Push**

If everything is configured correctly, your device or emulator should receive the notification.

If you do not see your device listed under test devices, the app may not have registered successfully. Check:
- `google-services.json` is in the correct location
- The package name in Firebase matches your app's `applicationId`
- The app has been opened at least once after OneSignal was added

---

## Sending Notifications from the Backend

The backend automatically sends notifications when order status changes. Here is how it works internally for reference:

```php
Http::withHeaders([
    'Authorization' => 'Basic ' . config('services.onesignal.api_key'),
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
])->post('https://onesignal.com/api/v1/notifications', [
    'app_id' => config('services.onesignal.app_id'),
    'include_player_ids' => [$customerPlayerToken],
    'headings' => ['en' => 'Order Update'],
    'contents' => ['en' => "Your order #SP123 has been shipped!"],
    'data' => [
        'type' => 'order_shipped',
        'order_number' => 'SP123',
    ],
]);
```

### Notification Types and Data Payloads

| Type | `data.type` | `data` fields |
|------|-------------|---------------|
| Order confirmed | `order_confirmed` | `order_number` |
| Order shipped | `order_shipped` | `order_number` |
| Order delivered | `order_delivered` | `order_number` |
| Order cancelled | `order_cancelled` | `order_number` |
| Promotional | `promo` | `link` (URL to open) |
| System | `system` | — |

The mobile app reads the `data` object to decide what screen to navigate to when the notification is tapped.

---

## Troubleshooting

### Notifications not received on emulator
Google Play Services are required for FCM notifications. Most stock emulators have Play Services installed. If yours does not:
- Use a **Google Play** emulator image in Android AVD Manager
- Or test on a physical device

### "Unregistered" device in OneSignal dashboard
The device's registration expired. Restart the app — OneSignal will re-register automatically.

### "App ID not found" error
The `ONESIGNAL_APP_ID` in your constants does not match what is in the OneSignal dashboard. Double-check the ID (it is a UUID format).

### Notifications received but app does not open the right screen
The `data` handler in the app may not be set up. Add a notification opened handler:
```typescript
OneSignal.setNotificationOpenedHandler(notification => {
  const data = notification.notification.additionalData;
  if (data?.type === 'order_shipped') {
    navigation.navigate('OrderDetail', { orderNumber: data.order_number });
  }
});
```

### Backend sends notification but it does not arrive
Check:
1. `ONESIGNAL_APP_ID` and `ONESIGNAL_API_KEY` are correct in `.env`
2. Queue worker is running: `php artisan queue:work`
3. Check `storage/logs/laravel.log` for HTTP errors from the OneSignal API call
4. Verify the player ID was saved correctly: check the `notification_tokens` table in your database

### Too many notifications / notification spam
Make sure the queue worker processes jobs only once. Check that you do not have multiple queue workers running, which could process the same job twice:
```bash
# Check for running workers
ps aux | grep "queue:work"
```

---

## Managing Notification Preferences (Optional)

If you want to let customers opt out of certain notification types, you can use OneSignal's tags system to segment users. For example, mark users who want order updates vs. promotional messages separately and only send to those segments.

This is an advanced feature — see the OneSignal documentation at https://documentation.onesignal.com for details.
