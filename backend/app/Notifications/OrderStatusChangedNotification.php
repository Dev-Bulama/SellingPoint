<?php

namespace App\Notifications;

use App\Models\Order;
use App\Models\Setting;
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
        $appName = Setting::get('app_name', 'SellingPoint');
        $status  = $this->order->status;
        $number  = $this->order->order_number;
        $total   = number_format($this->order->total, 2);

        $vars = [
            '{app_name}'     => $appName,
            '{user_name}'    => $notifiable->name,
            '{order_number}' => $number,
            '{order_total}'  => $total,
        ];

        // Default subject + body per status
        [$defaultSubject, $defaultBody] = match ($status) {
            'confirmed'  => [
                "Order {$number} Confirmed!",
                "We have received your order and are preparing it for processing.",
            ],
            'processing' => [
                "Order {$number} is Being Processed",
                "Our team is packing your items and getting them ready for shipment.",
            ],
            'shipped'    => [
                "Order {$number} Has Been Shipped!",
                "Great news — your order is on its way!\n\nYour package has been dispatched and is heading to you. You will receive it within the estimated delivery window.",
            ],
            'delivered'  => [
                "Order {$number} Delivered",
                "We hope you enjoy your purchase! If anything is wrong, please contact our support team.",
            ],
            'cancelled'  => [
                "Order {$number} Cancelled",
                $this->order->cancellation_reason
                    ? 'Reason: ' . $this->order->cancellation_reason
                    : "Your order was cancelled. If you have questions, please contact support.",
            ],
            default => [
                "Order {$number} Update",
                "Your order is now: {$status}.",
            ],
        };

        $settingPrefix = 'email_order_' . $status;
        $subject = Setting::get("{$settingPrefix}_subject", '') ?: $defaultSubject;
        $body    = Setting::get("{$settingPrefix}_body", '')    ?: $defaultBody;

        $subject = strtr($subject, $vars);
        $body    = strtr($body, $vars);

        $mail = (new MailMessage)
            ->subject($subject)
            ->greeting('Hello ' . $notifiable->name . ',');

        foreach (explode("\n\n", $body) as $paragraph) {
            $paragraph = trim($paragraph);
            if ($paragraph !== '') {
                $mail->line($paragraph);
            }
        }

        return $mail
            ->line("**Order:** {$number}")
            ->line("**Total:** ₦{$total}")
            ->salutation("Thank you for shopping with {$appName}!");
    }
}
