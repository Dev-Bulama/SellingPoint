<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\BannerResource;
use App\Models\Banner;
use App\Models\Faq;
use App\Models\FlashSale;
use App\Models\Page;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CmsController extends Controller
{
    public function banners(Request $request): JsonResponse
    {
        $type    = $request->type ?? 'slider';
        $banners = Banner::active()->where('type', $type)->orderBy('sort_order')->get();
        return response()->json(['data' => BannerResource::collection($banners)]);
    }

    public function page(string $slug): JsonResponse
    {
        $page = Page::where('slug', $slug)->where('is_active', true)->firstOrFail();
        return response()->json(['data' => ['title' => $page->title, 'content' => $page->content]]);
    }

    public function faqs(Request $request): JsonResponse
    {
        $faqs = Faq::where('is_active', true)
            ->when($request->category, fn($q) => $q->where('category', $request->category))
            ->orderBy('sort_order')->get();
        return response()->json(['data' => $faqs]);
    }

    public function settings(): JsonResponse
    {
        $keys = [
            'app_name', 'app_logo', 'support_email', 'support_phone', 'whatsapp_number',
            'currency', 'currency_symbol', 'paystack_public_key', 'cash_on_delivery_enabled',
            'maintenance_mode', 'min_app_version', 'force_update_message',
            'tax_percentage', 'about_app',
        ];

        $settings = [];
        foreach ($keys as $key) {
            $settings[$key] = Setting::get($key);
        }

        // Fall back to .env for paystack_public_key if not set in DB
        if (empty($settings['paystack_public_key'])) {
            $settings['paystack_public_key'] = env('PAYSTACK_PUBLIC_KEY');
        }

        // Cast booleans
        $settings['maintenance_mode']         = (bool) $settings['maintenance_mode'];
        $settings['cash_on_delivery_enabled'] = (bool) $settings['cash_on_delivery_enabled'];

        return response()->json(['data' => $settings]);
    }

    public function flashSales(): JsonResponse
    {
        $sale = FlashSale::active()->with('products.images')->first();
        if (!$sale) {
            return response()->json(['data' => null]);
        }
        return response()->json([
            'data' => [
                'id'         => $sale->id,
                'title'      => $sale->title,
                'ends_at'    => $sale->ends_at,
                'products'   => $sale->products->map(fn($p) => [
                    'id'           => $p->id,
                    'name'         => $p->name,
                    'slug'         => $p->slug,
                    'thumbnail_url' => $p->thumbnail_url,
                    'price'        => $p->price,
                    'sale_price'   => $p->pivot->sale_price,
                    'discount_pct' => $p->pivot->discount_percentage,
                ]),
            ],
        ]);
    }
}
