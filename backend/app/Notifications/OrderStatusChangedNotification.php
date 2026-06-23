<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusChangedNotification extends Notification
{
    use Queueable;

    public function __construct(private Order $order, private string $oldStatus)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appName  = \App\Models\Setting::get('app_name', 'SellingPoint');
        $status   = $this->order->status;
        $number   = $this->order->order_number;

        [$subject, $headline, $detail] = match ($status) {
            'confirmed'  => [
                "Order {$number} Confirmed!",
                'Your order has been confirmed.',
                'We have received your order and are preparing it for processing.',
            ],
            'processing' => [
                "Order {$number} is Being Processed",
                'Your order is now being processed.',
                'Our team is packing your items and getting them ready for shipment.',
            ],
            'shipped'    => [
                "Order {$number} Has Been Shipped!",
                'Great news — your order is on its way!',
                'Your package has been dispatched and is on its way to you.',
            ],
            'delivered'  => [
                "Order {$number} Delivered",
                'Your order has been delivered.',
                'We hope you enjoy your purchase! If anything is wrong, please contact our support team.',
            ],
            'cancelled'  => [
                "Order {$number} Cancelled",
                'Your order has been cancelled.',
                $this->order->cancellation_reason
                    ? 'Reason: ' . $this->order->cancellation_reason
                    : 'Your order was cancelled. If you have questions, please contact support.',
            ],
            default => [
                "Order {$number} Update",
                'Your order status has been updated.',
                "Your order is now: {$status}.",
            ],
        };

        $mail = (new MailMessage)
            ->subject($subject)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line($headline)
            ->line($detail)
            ->line("**Order:** {$number}")
            ->line('**Total:** ' . number_format($this->order->total, 2));

        if ($status === 'shipped') {
            $mail->line('You will receive your package within the estimated delivery window.');
        }

        return $mail
            ->salutation("Thank you for shopping with {$appName}!");
    }
}
