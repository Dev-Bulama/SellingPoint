<?php

use App\Models\Page;
use App\Models\Setting;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $appName  = Setting::get('app_name', 'SellingPoint');
    $appLogo  = Setting::get('app_logo');

    if ($appLogo && !str_starts_with($appLogo, 'http')) {
        $appLogo = request()->getSchemeAndHttpHost() . '/storage/' . ltrim($appLogo, '/');
    }

    $primaryColor = Setting::get('brand_color', '#F97316');
    $primaryDark  = Setting::get('brand_color_dark', '#EA6C0B');
    $primaryLight = Setting::get('brand_color_light', '#FFF3E8');

    try {
        $stats = [
            'products'   => \App\Models\Product::count(),
            'customers'  => \App\Models\User::whereHas('roles', fn($q) => $q->where('name', 'customer'))->count(),
            'orders'     => \App\Models\Order::whereIn('status', ['delivered', 'shipped'])->count(),
            'categories' => \App\Models\Category::count(),
        ];
    } catch (\Throwable $e) {
        $stats = ['products' => 0, 'customers' => 0, 'orders' => 0, 'categories' => 0];
    }

    return view('landing', [
        'appName'      => $appName,
        'appLogo'      => $appLogo,
        'primaryColor' => $primaryColor,
        'primaryDark'  => $primaryDark,
        'primaryLight' => $primaryLight,
        'stats'        => $stats,
        'supportEmail' => Setting::get('support_email'),
        'playStoreUrl' => Setting::get('play_store_url'),
        'appStoreUrl'  => Setting::get('app_store_url'),
    ]);
});

// ── CMS public pages (privacy-policy, terms-and-conditions, about-us, etc.) ──
Route::get('/{slug}', function (string $slug) {
    $page = Page::where('slug', $slug)->where('is_active', true)->firstOrFail();

    $appName      = Setting::get('app_name', 'SellingPoint');
    $primaryColor = Setting::get('brand_color', '#F97316');
    $primaryDark  = Setting::get('brand_color_dark', '#EA6C0B');

    $appLogo = Setting::get('app_logo');
    if ($appLogo && !str_starts_with($appLogo, 'http')) {
        $appLogo = request()->getSchemeAndHttpHost() . '/storage/' . ltrim($appLogo, '/');
    }

    return view('page', compact('page', 'appName', 'primaryColor', 'primaryDark', 'appLogo'));
})->where('slug', 'privacy-policy|terms-and-conditions|about-us|data-deletion');

