<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appName = \App\Models\Setting::get('app_name', 'SellingPoint');

        return (new MailMessage)
            ->subject("Welcome to {$appName}! Your account is ready")
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line("Thank you for joining {$appName}! We're excited to have you.")
            ->line('Your account has been created successfully. You can now browse thousands of products, track your orders, and enjoy a seamless shopping experience.')
            ->action('Start Shopping', config('app.url'))
            ->line('If you have any questions, our support team is always here to help.')
            ->salutation("Welcome aboard, The {$appName} Team");
    }
}
