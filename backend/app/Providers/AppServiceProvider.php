<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use App\Models\Order;
use App\Models\Review;
use App\Models\Setting;
use App\Observers\OrderObserver;
use App\Observers\ReviewObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS so Livewire generates correct POST URLs on Hostinger
        if (
            request()->server('HTTPS') === 'on'
            || request()->server('HTTP_X_FORWARDED_PROTO') === 'https'
            || str_starts_with(config('app.url', ''), 'https://')
        ) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        Order::observe(OrderObserver::class);
        Review::observe(ReviewObserver::class);

        $this->applyMailConfigFromSettings();

        // Authenticated routes — generous limit per user
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });

        // Public browse routes — per IP
        RateLimiter::for('public-api', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip());
        });

        // Auth endpoints — strict to slow brute-force
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });
    }

    private function applyMailConfigFromSettings(): void
    {
        try {
            $host = Setting::get('mail_host', '');
            if (empty($host)) return;

            config([
                'mail.default'                 => Setting::get('mail_mailer', 'smtp'),
                'mail.mailers.smtp.host'       => $host,
                'mail.mailers.smtp.port'       => (int) Setting::get('mail_port', 587),
                'mail.mailers.smtp.encryption' => Setting::get('mail_encryption', 'tls'),
                'mail.mailers.smtp.username'   => Setting::get('mail_username', ''),
                'mail.mailers.smtp.password'   => Setting::get('mail_password', ''),
                'mail.from.address'            => Setting::get('mail_from_address', ''),
                'mail.from.name'               => Setting::get('mail_from_name', config('app.name')),
            ]);
        } catch (\Throwable) {
            // DB not ready (migrations, fresh install) — skip silently
        }
    }
}
