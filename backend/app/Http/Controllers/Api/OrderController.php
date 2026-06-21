<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CheckoutRequest;
use App\Http\Resources\Api\OrderResource;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\ShippingZone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()->orders()
            ->with(['items', 'payment'])
            ->latest()->paginate(15);

        return response()->json([
            'data' => OrderResource::collection($orders),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
                'total'        => $orders->total(),
            ],
        ]);
    }

    public function show(Request $request, string $orderNumber): JsonResponse
    {
        $order = $request->user()->orders()
            ->where('order_number', $orderNumber)
            ->with(['items', 'payment'])
            ->firstOrFail();
        return response()->json(['data' => new OrderResource($order)]);
    }

    public function checkout(CheckoutRequest $request): JsonResponse
    {
        $user    = $request->user();
        $cart    = Cart::where('user_id', $user->id)->with(['items.product', 'items.variant'])->firstOrFail();
        $address = $user->addresses()->findOrFail($request->address_id);

        if ($cart->items->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 422);
        }

        // Validate stock
        foreach ($cart->items as $item) {
            if ($item->product->stock_quantity < $item->quantity) {
                return response()->json([
                    'message' => "Insufficient stock for: {$item->product->name}",
                ], 422);
            }
        }

        $subtotal = $cart->total;

        // Shipping zone
        $zone        = ShippingZone::where('is_active', true)
            ->whereJsonContains('states', $address->state)->first();
        $shippingFee = $zone?->getShippingFee($subtotal) ?? 0;

        // Coupon
        $discount = 0;
        $coupon   = null;
        if ($request->coupon_code) {
            $coupon = Coupon::where('code', strtoupper($request->coupon_code))->first();
            if ($coupon && $coupon->isValid()) {
                $discount = $coupon->calculateDiscount($subtotal);
            }
        }

        $total = max(0, $subtotal + $shippingFee - $discount);

        $order = DB::transaction(function () use (
            $user, $cart, $address, $zone, $coupon, $subtotal, $shippingFee, $discount, $total, $request
        ) {
            $order = Order::create([
                'order_number'       => Order::generateOrderNumber(),
                'user_id'            => $user->id,
                'coupon_id'          => $coupon?->id,
                'shipping_zone_id'   => $zone?->id,
                'delivery_name'      => $address->full_name,
                'delivery_phone'     => $address->phone,
                'delivery_address'   => $address->address_line1 . ($address->address_line2 ? ', ' . $address->address_line2 : ''),
                'delivery_city'      => $address->city,
                'delivery_state'     => $address->state,
                'delivery_country'   => $address->country,
                'delivery_postal_code' => $address->postal_code,
                'subtotal'           => $subtotal,
                'shipping_fee'       => $shippingFee,
                'discount_amount'    => $discount,
                'total'              => $total,
                'payment_method'     => $request->payment_method,
                'coupon_code'        => $request->coupon_code,
                'notes'              => $request->notes,
            ]);

            foreach ($cart->items as $item) {
                OrderItem::create([
                    'order_id'           => $order->id,
                    'product_id'         => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'product_name'       => $item->product->name,
                    'product_image'      => $item->product->thumbnail_url,
                    'variant_name'       => $item->variant ? "{$item->variant->name}: {$item->variant->value}" : null,
                    'quantity'           => $item->quantity,
                    'unit_price'         => $item->price,
                    'total_price'        => $item->price * $item->quantity,
                ]);

                // Decrement stock
                $item->product->decrement('stock_quantity', $item->quantity);
                $item->product->increment('sold_count', $item->quantity);
            }

            if ($coupon) {
                $coupon->increment('usage_count');
            }

            // Clear cart
            $cart->items()->delete();

            return $order;
        });

        $order->load(['items', 'payment']);
        return response()->json(['message' => 'Order placed', 'data' => new OrderResource($order)], 201);
    }

    public function cancel(Request $request, string $orderNumber): JsonResponse
    {
        $request->validate(['reason' => 'nullable|string|max:500']);
        $order = $request->user()->orders()
            ->where('order_number', $orderNumber)
            ->whereIn('status', ['pending', 'confirmed'])
            ->firstOrFail();

        $order->update([
            'status'               => 'cancelled',
            'cancellation_reason'  => $request->reason,
            'cancelled_at'         => now(),
        ]);

        return response()->json(['message' => 'Order cancellation requested']);
    }

    public function validateCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code'     => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', strtoupper($request->code))->first();

        if (!$coupon || !$coupon->isValid()) {
            return response()->json(['message' => 'Invalid or expired coupon'], 422);
        }

        if ($request->subtotal < $coupon->minimum_order_amount) {
            return response()->json([
                'message' => "Minimum order amount is ₦{$coupon->minimum_order_amount}",
            ], 422);
        }

        $discount = $coupon->calculateDiscount($request->subtotal);

        return response()->json([
            'message'  => 'Coupon applied',
            'coupon'   => ['code' => $coupon->code, 'type' => $coupon->type, 'value' => $coupon->value],
            'discount' => $discount,
        ]);
    }
}
