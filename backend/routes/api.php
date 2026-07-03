<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\CmsController;
use App\Http\Controllers\Api\SupportController;
use Illuminate\Support\Facades\Route;

// ─── Public Routes ───────────────────────────────────────────────────────────

// Ping is exempt from API key so the app can check connectivity before auth
Route::match(['get', 'head'], 'v1/ping', fn() => response()->json(['ok' => true]));

Route::prefix('v1')->middleware('api.key')->group(function () {

    // Connectivity check — no auth required (also registered above without key check)
    Route::match(['get', 'head'], 'ping', fn() => response()->json(['ok' => true]));

    // Auth (rate-limited)
    Route::prefix('auth')->middleware('throttle:auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login',    [AuthController::class, 'login']);
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('reset-password',  [AuthController::class, 'resetPassword']);
    });

    // Products (public)
    Route::prefix('products')->name('api.products.')->group(function () {
        Route::get('/',              [ProductController::class, 'index'])->name('index');
        Route::get('featured',       [ProductController::class, 'featured']);
        Route::get('new-arrivals',   [ProductController::class, 'newArrivals']);
        Route::get('best-sellers',   [ProductController::class, 'bestSellers']);
        Route::get('flash-sales',    [ProductController::class, 'flashSales']);
        Route::get('{slug}',         [ProductController::class, 'show'])->name('show');
        Route::get('{slug}/related', [ProductController::class, 'related']);
        Route::get('{slug}/reviews', [ReviewController::class, 'index']);
    });

    Route::get('categories', [ProductController::class, 'categories']);
    Route::get('brands',     [ProductController::class, 'brands']);

    // CMS
    Route::prefix('cms')->group(function () {
        Route::get('banners',     [CmsController::class, 'banners']);
        Route::get('flash-sales', [CmsController::class, 'flashSales']);
        Route::get('settings',    [CmsController::class, 'settings']);
        Route::get('faqs',        [CmsController::class, 'faqs']);
        Route::get('pages/{slug}', [CmsController::class, 'page']);
    });

    // Convenience alias for mobile app
    Route::get('app/settings', [CmsController::class, 'settings']);

    // Paystack webhook (no auth — verified by signature)
    Route::post('payments/webhook', [PaymentController::class, 'webhook']);

    // ─── Authenticated Routes ─────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::prefix('auth')->group(function () {
            Route::post('logout',          [AuthController::class, 'logout']);
            Route::get('profile',          [AuthController::class, 'profile']);
            Route::post('profile',         [AuthController::class, 'updateProfile']);
            Route::post('change-password', [AuthController::class, 'changePassword']);
            Route::delete('account',       [AuthController::class, 'deleteAccount']);
        });

        // Addresses
        Route::apiResource('addresses', AddressController::class);
        Route::post('addresses/{id}/set-default', [AddressController::class, 'setDefault']);

        // Cart
        Route::prefix('cart')->group(function () {
            Route::get('/',            [CartController::class, 'index']);
            Route::post('add',         [CartController::class, 'add']);
            Route::put('items/{id}',   [CartController::class, 'update']);
            Route::delete('items/{id}',[CartController::class, 'remove']);
            Route::delete('clear',     [CartController::class, 'clear']);
        });

        // Wishlist
        Route::prefix('wishlist')->group(function () {
            Route::get('/',              [WishlistController::class, 'index']);
            Route::post('toggle',        [WishlistController::class, 'toggle']);
            Route::get('check/{productId}', [WishlistController::class, 'check']);
        });

        // Orders & Checkout
        Route::prefix('orders')->group(function () {
            Route::get('/',                [OrderController::class, 'index']);
            Route::post('checkout',        [OrderController::class, 'checkout']);
            Route::post('validate-coupon', [OrderController::class, 'validateCoupon']);
            Route::get('{orderNumber}',       [OrderController::class, 'show']);
            Route::get('{orderNumber}/track', [OrderController::class, 'track']);
            Route::post('{orderNumber}/cancel', [OrderController::class, 'cancel']);
        });

        // Payments
        Route::prefix('payments')->group(function () {
            Route::post('initialize', [PaymentController::class, 'initialize']);
            Route::post('verify',     [PaymentController::class, 'verify']);
        });

        // Reviews
        Route::post('reviews', [ReviewController::class, 'store']);

        // Notifications
        Route::prefix('notifications')->group(function () {
            Route::get('/',              [NotificationController::class, 'index']);
            Route::post('{id}/read',     [NotificationController::class, 'markRead']);
            Route::post('mark-all-read', [NotificationController::class, 'markAllRead']);
            Route::post('push-token',    [NotificationController::class, 'savePushToken']);
        });

        // Recently viewed
        Route::get('recently-viewed', [ProductController::class, 'recentlyViewed']);

        // Support
        Route::post('support/issues', [SupportController::class, 'submitIssue']);
        Route::get('support/issues',  [SupportController::class, 'myIssues']);
    });
});
