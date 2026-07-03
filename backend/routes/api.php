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

Route::prefix('v1')->group(function () {

    // ── Ping — no signing required (used for connectivity checks) ─────────────
    Route::match(['get', 'head'], 'ping', fn() => response()->json(['ok' => true]));

    // ── Paystack webhook — verified by Paystack signature, not ours ───────────
    Route::post('payments/webhook', [PaymentController::class, 'webhook']);

    // ── Public signed routes ── requires valid HMAC signature (_t + _s params) ─
    Route::middleware(['api.sign', 'throttle:public-api'])->group(function () {

        // Auth (extra-tight rate limit via named throttle)
        Route::prefix('auth')->middleware('throttle:auth')->group(function () {
            Route::post('register',        [AuthController::class, 'register']);
            Route::post('login',           [AuthController::class, 'login']);
            Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
            Route::post('reset-password',  [AuthController::class, 'resetPassword']);
        });

        // Products
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
            Route::get('banners',      [CmsController::class, 'banners']);
            Route::get('flash-sales',  [CmsController::class, 'flashSales']);
            Route::get('settings',     [CmsController::class, 'settings']);
            Route::get('faqs',         [CmsController::class, 'faqs']);
            Route::get('pages/{slug}', [CmsController::class, 'page']);
        });

        Route::get('app/settings', [CmsController::class, 'settings']);
    });

    // ── Authenticated routes ── Sanctum token + HMAC signature ────────────────
    Route::middleware(['auth:sanctum', 'api.sign', 'throttle:api'])->group(function () {

        Route::prefix('auth')->group(function () {
            Route::post('logout',          [AuthController::class, 'logout']);
            Route::get('profile',          [AuthController::class, 'profile']);
            Route::post('profile',         [AuthController::class, 'updateProfile']);
            Route::post('change-password', [AuthController::class, 'changePassword']);
            Route::delete('account',       [AuthController::class, 'deleteAccount']);
        });

        Route::apiResource('addresses', AddressController::class);
        Route::post('addresses/{id}/set-default', [AddressController::class, 'setDefault']);

        Route::prefix('cart')->group(function () {
            Route::get('/',             [CartController::class, 'index']);
            Route::post('add',          [CartController::class, 'add']);
            Route::put('items/{id}',    [CartController::class, 'update']);
            Route::delete('items/{id}', [CartController::class, 'remove']);
            Route::delete('clear',      [CartController::class, 'clear']);
        });

        Route::prefix('wishlist')->group(function () {
            Route::get('/',                 [WishlistController::class, 'index']);
            Route::post('toggle',           [WishlistController::class, 'toggle']);
            Route::get('check/{productId}', [WishlistController::class, 'check']);
        });

        Route::prefix('orders')->group(function () {
            Route::get('/',                     [OrderController::class, 'index']);
            Route::post('checkout',             [OrderController::class, 'checkout']);
            Route::post('validate-coupon',      [OrderController::class, 'validateCoupon']);
            Route::get('{orderNumber}',         [OrderController::class, 'show']);
            Route::get('{orderNumber}/track',   [OrderController::class, 'track']);
            Route::post('{orderNumber}/cancel', [OrderController::class, 'cancel']);
        });

        Route::prefix('payments')->group(function () {
            Route::post('initialize', [PaymentController::class, 'initialize']);
            Route::post('verify',     [PaymentController::class, 'verify']);
        });

        Route::post('reviews', [ReviewController::class, 'store']);

        Route::prefix('notifications')->group(function () {
            Route::get('/',               [NotificationController::class, 'index']);
            Route::post('{id}/read',      [NotificationController::class, 'markRead']);
            Route::post('mark-all-read',  [NotificationController::class, 'markAllRead']);
            Route::post('push-token',     [NotificationController::class, 'savePushToken']);
        });

        Route::get('recently-viewed', [ProductController::class, 'recentlyViewed']);

        Route::post('support/issues', [SupportController::class, 'submitIssue']);
        Route::get('support/issues',  [SupportController::class, 'myIssues']);
    });
});
