<?php

namespace App\Notifications;

use App\Models\Setting;
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
        $appName = Setting::get('app_name', 'SellingPoint');
        $vars    = ['{app_name}' => $appName, '{user_name}' => $notifiable->name];

        $subject = Setting::get('email_welcome_subject', '')
            ?: "Welcome to {$appName}! Your account is ready";
        $body    = Setting::get('email_welcome_body', '')
            ?: "Thank you for joining {$appName}! We're excited to have you.\n\nYour account is ready. Browse thousands of products and enjoy a seamless shopping experience.\n\nIf you need help, our support team is always here.";

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
            ->action('Start Shopping', config('app.url'))
            ->salutation("Welcome aboard, The {$appName} Team");
    }
}
