<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\CartResource;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    private function getCart(Request $request): Cart
    {
        return Cart::firstOrCreate(['user_id' => $request->user()->id]);
    }

    public function index(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);
        $cart->load(['items.product.images', 'items.variant']);
        return response()->json(['data' => new CartResource($cart)]);
    }

    public function add(Request $request): JsonResponse
    {
        $request->validate([
            'product_id'         => 'required|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
            'quantity'           => 'required|integer|min:1|max:100',
        ]);

        $product = Product::findOrFail($request->product_id);

        if ($product->stock_quantity < $request->quantity) {
            return response()->json(['message' => 'Insufficient stock'], 422);
        }

        $price = $product->effective_price;
        if ($request->product_variant_id) {
            $variant = ProductVariant::find($request->product_variant_id);
            $price += $variant?->price_modifier ?? 0;
        }

        $cart = $this->getCart($request);
        $item = CartItem::updateOrCreate(
            [
                'cart_id'            => $cart->id,
                'product_id'         => $request->product_id,
                'product_variant_id' => $request->product_variant_id,
            ],
            [
                'quantity' => \DB::raw("quantity + {$request->quantity}"),
                'price'    => $price,
            ]
        );

        $cart->load(['items.product.images', 'items.variant']);
        return response()->json(['message' => 'Added to cart', 'data' => new CartResource($cart)]);
    }

    public function update(Request $request, int $itemId): JsonResponse
    {
        $request->validate(['quantity' => 'required|integer|min:1|max:100']);

        $cart = $this->getCart($request);
        $item = $cart->items()->findOrFail($itemId);

        if ($item->product->stock_quantity < $request->quantity) {
            return response()->json(['message' => 'Insufficient stock'], 422);
        }

        $item->update(['quantity' => $request->quantity]);
        $cart->load(['items.product.images', 'items.variant']);
        return response()->json(['message' => 'Cart updated', 'data' => new CartResource($cart)]);
    }

    public function remove(Request $request, int $itemId): JsonResponse
    {
        $cart = $this->getCart($request);
        $cart->items()->findOrFail($itemId)->delete();
        $cart->load(['items.product.images', 'items.variant']);
        return response()->json(['message' => 'Item removed', 'data' => new CartResource($cart)]);
    }

    public function clear(Request $request): JsonResponse
    {
        $this->getCart($request)->items()->delete();
        return response()->json(['message' => 'Cart cleared']);
    }
}
