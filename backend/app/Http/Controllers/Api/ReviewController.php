<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreReviewRequest;
use App\Http\Resources\Api\ReviewResource;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReviewController extends Controller
{
    public function index(string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)->firstOrFail();
        $reviews = Review::where('product_id', $product->id)
            ->where('status', 'approved')
            ->with('user')
            ->latest()->paginate(15);

        return response()->json([
            'data' => ReviewResource::collection($reviews),
            'summary' => [
                'average_rating' => $product->average_rating,
                'review_count'   => $product->review_count,
            ],
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page'    => $reviews->lastPage(),
            ],
        ]);
    }

    public function store(StoreReviewRequest $request): JsonResponse
    {
        $existing = Review::where('product_id', $request->product_id)
            ->where('user_id', $request->user()->id)
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'You have already reviewed this product'], 422);
        }

        $images = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $images[] = $image->store('reviews', 'public');
            }
        }

        $hasVerifiedPurchase = $request->user()->orders()
            ->where('payment_status', 'paid')
            ->whereHas('items', fn($q) => $q->where('product_id', $request->product_id))
            ->exists();

        $review = Review::create([
            'product_id'          => $request->product_id,
            'user_id'             => $request->user()->id,
            'order_id'            => $request->order_id,
            'rating'              => $request->rating,
            'title'               => $request->title,
            'body'                => $request->body,
            'images'              => $images,
            'status'              => 'pending',
            'is_verified_purchase' => $hasVerifiedPurchase,
        ]);

        return response()->json(['message' => 'Review submitted for approval'], 201);
    }
}
