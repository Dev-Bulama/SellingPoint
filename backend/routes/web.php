<?php

use App\Models\Setting;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $appName  = Setting::get('app_name', 'SellingPoint');
    $appLogo  = Setting::get('app_logo');

    if ($appLogo && !str_starts_with($appLogo, 'http')) {
        $appLogo = request()->getSchemeAndHttpHost() . '/storage/' . ltrim($appLogo, '/');
    }

    // Brand color from settings (admin can override), default is the app orange
    $primaryColor = Setting::get('brand_color', '#F97316');
    // Derive dark/light variants
    $primaryDark  = Setting::get('brand_color_dark', '#EA6C0B');
    $primaryLight = Setting::get('brand_color_light', '#FFF3E8');

    // Live stats pulled from DB
    $stats = [
        'products'   => \App\Models\Product::count(),
        'customers'  => \App\Models\User::whereHas('roles', fn($q) => $q->where('name', 'customer'))->count(),
        'orders'     => \App\Models\Order::whereIn('status', ['delivered', 'shipped'])->count(),
        'categories' => \App\Models\Category::count(),
    ];

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
