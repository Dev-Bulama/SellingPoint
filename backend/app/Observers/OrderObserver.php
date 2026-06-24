<?php

namespace App\Observers;

use App\Models\Order;
use App\Notifications\OrderStatusChangedNotification;

class OrderObserver
{
    public function updating(Order $order): void
    {
        if ($order->isDirty('status') && $order->user) {
            $oldStatus = $order->getOriginal('status');
            // Store for use in updated() to ensure DB write completed first
            $order->_previousStatus = $oldStatus;
        }
    }

    public function updated(Order $order): void
    {
        if ($order->wasChanged('status') && $order->user) {
            $oldStatus = $order->_previousStatus ?? null;
            try {
                $order->user->notify(new OrderStatusChangedNotification($order, $oldStatus ?? ''));
            } catch (\Throwable) {
                // Mail not configured — skip silently, order update still succeeds
            }
        }
    }
}
