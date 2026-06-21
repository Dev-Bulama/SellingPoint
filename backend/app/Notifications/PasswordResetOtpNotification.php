<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordResetOtpNotification extends Notification
{
    use Queueable;

    public function __construct(private string $otp)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your SellingPoint Password Reset Code')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('We received a request to reset your SellingPoint account password.')
            ->line('Use the code below to complete your password reset:')
            ->line('**' . $this->otp . '**')
            ->line('This code is valid for **10 minutes**. Do not share it with anyone.')
            ->line('If you did not request a password reset, you can safely ignore this email.')
            ->salutation('The SellingPoint Team');
    }
}
