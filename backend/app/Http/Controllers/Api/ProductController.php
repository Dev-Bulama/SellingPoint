<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\ProductResource;
use App\Http\Resources\Api\CategoryResource;
use App\Http\Resources\Api\BrandResource;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\RecentlyViewed;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()
            ->active()
            ->with(['category', 'brand', 'images'])
            ->withCount(['reviews as reviews_count' => fn($q) => $q->where('status', 'approved')]);

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->brand_id) {
            $query->where('brand_id', $request->brand_id);
        }
        if ($request->min_price) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->max_price) {
            $query->where('price', '<=', $request->max_price);
        }
        if ($request->min_rating) {
            $query->where('average_rating', '>=', $request->min_rating);
        }
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('short_description', 'like', "%{$request->search}%");
            });
        }
        if ($request->in_stock) {
            $query->inStock();
        }

        $sortField = match($request->sort) {
            'price_asc'    => ['price', 'asc'],
            'price_desc'   => ['price', 'desc'],
            'popular'      => ['sold_count', 'desc'],
            'rating'       => ['average_rating', 'desc'],
            'discount'     => ['discount_price', 'asc'],
            default        => ['created_at', 'desc'],
        };
        $query->orderBy(...$sortField);

        $products = $query->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'total'        => $products->total(),
                'per_page'     => $products->perPage(),
            ],
        ]);
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)->active()
            ->with(['category', 'brand', 'images', 'variants', 'reviews.user'])
            ->firstOrFail();

        $product->increment('view_count');

        if ($request->user()) {
            RecentlyViewed::updateOrCreate(
                ['user_id' => $request->user()->id, 'product_id' => $product->id],
                ['viewed_at' => now()]
            );
        }

        return response()->json(['data' => new ProductResource($product)]);
    }

    public function featured(): JsonResponse
    {
        $products = Cache::remember('api:products:featured', 600, fn() =>
            Product::active()->featured()->inStock()
                ->with(['images', 'category'])->limit(20)->get()
        );
        return response()->json(['data' => ProductResource::collection($products)]);
    }

    public function newArrivals(): JsonResponse
    {
        $products = Cache::remember('api:products:new-arrivals', 600, fn() =>
            Product::active()->where('is_new_arrival', true)->inStock()
                ->with(['images', 'category'])->latest()->limit(20)->get()
        );
        return response()->json(['data' => ProductResource::collection($products)]);
    }

    public function bestSellers(): JsonResponse
    {
        $products = Product::active()->where('is_best_seller', true)->inStock()
            ->with(['images', 'category'])->orderByDesc('sold_count')->limit(20)->get();
        return response()->json(['data' => ProductResource::collection($products)]);
    }

    public function flashSales(): JsonResponse
    {
        $products = Product::active()->where('is_flash_sale', true)->inStock()
            ->with(['images'])->limit(20)->get();
        return response()->json(['data' => ProductResource::collection($products)]);
    }

    public function related(string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)->firstOrFail();
        $related = Product::active()->inStock()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(['images'])
            ->limit(10)->get();
        return response()->json(['data' => ProductResource::collection($related)]);
    }

    public function recentlyViewed(Request $request): JsonResponse
    {
        $items = RecentlyViewed::where('user_id', $request->user()->id)
            ->with(['product.images'])
            ->orderByDesc('viewed_at')
            ->limit(20)->get();

        $products = $items->pluck('product')->filter();
        return response()->json(['data' => ProductResource::collection($products)]);
    }

    public function categories(): JsonResponse
    {
        $categories = Category::where('is_active', true)->whereNull('parent_id')
            ->with('children')->withCount('products')
            ->orderBy('sort_order')->get();
        return response()->json(['data' => CategoryResource::collection($categories)]);
    }

    public function brands(): JsonResponse
    {
        $brands = Brand::where('is_active', true)->withCount('products')->get();
        return response()->json(['data' => BrandResource::collection($brands)]);
    }
}
