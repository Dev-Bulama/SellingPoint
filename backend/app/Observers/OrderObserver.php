<?php

namespace App\Observers;

use App\Models\Order;
use App\Notifications\OrderStatusChangedNotification;

class OrderObserver
{
    // Keyed by order ID so parallel updates don't bleed into each other
    private static array $previousStatuses = [];

    public function updating(Order $order): void
    {
        if ($order->isDirty('status')) {
            self::$previousStatuses[$order->getKey()] = $order->getOriginal('status');
        }
    }

    public function updated(Order $order): void
    {
        if ($order->wasChanged('status') && $order->user) {
            $oldStatus = self::$previousStatuses[$order->getKey()] ?? '';
            unset(self::$previousStatuses[$order->getKey()]);
            try {
                $order->user->notify(new OrderStatusChangedNotification($order, $oldStatus));
            } catch (\Throwable) {
                // Mail not configured — skip silently, order update still succeeds
            }
        }
    }
}
