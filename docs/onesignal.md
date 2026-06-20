# OneSignal Push Notifications Guide

## Setup

1. Create an account at [onesignal.com](https://onesignal.com)
2. Create a new app → select **Mobile Push**
3. Configure Android (Firebase FCM) and/or iOS (APNs)
4. Copy **App ID** and **REST API Key**

## Backend Configuration

Add to `.env`:

```env
ONESIGNAL_APP_ID=your-app-id-here
ONESIGNAL_API_KEY=your-rest-api-key-here
```

These are also configurable via **Admin → Settings → OneSignal**.

## Mobile Integration

### Install SDK

```bash
npm install react-native-onesignal
```

### Initialize in App.tsx

```typescript
import OneSignal from 'react-native-onesignal';

OneSignal.setAppId(ONESIGNAL_APP_ID);
OneSignal.promptForPushNotificationsWithUserResponse();

// Get player ID and save to backend
OneSignal.addSubscriptionObserver(event => {
  if (event.to.isSubscribed) {
    notificationsApi.savePushToken(event.to.userId, 'android');
  }
});
```

## Sending Notifications

The backend sends push notifications via the OneSignal REST API.

### Example — Order Status Update

```php
Http::withHeaders([
    'Authorization' => 'Basic ' . config('services.onesignal.api_key'),
    'Content-Type' => 'application/json',
])->post('https://onesignal.com/api/v1/notifications', [
    'app_id' => config('services.onesignal.app_id'),
    'include_player_ids' => [$playerToken],
    'headings' => ['en' => 'Order Shipped! 🚚'],
    'contents' => ['en' => "Your order #{$orderNumber} is on its way."],
    'data' => ['type' => 'order_update', 'order_number' => $orderNumber],
]);
```

## Notification Types

| Type | Trigger | Data |
|------|---------|------|
| `order_confirmed` | Admin confirms order | `order_number` |
| `order_shipped` | Admin marks as shipped | `order_number` |
| `order_delivered` | Admin marks as delivered | `order_number` |
| `promo` | Admin campaign | `link` |
| `system` | Admin broadcast | — |

## Testing

Use the OneSignal Dashboard → **Messages → New Push** to send test notifications to specific player IDs.
