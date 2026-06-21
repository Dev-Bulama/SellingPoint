<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_number', 'user_id', 'coupon_id', 'shipping_zone_id',
        'delivery_name', 'delivery_phone', 'delivery_address', 'delivery_city',
        'delivery_state', 'delivery_country', 'delivery_postal_code',
        'subtotal', 'shipping_fee', 'discount_amount', 'tax_amount', 'total',
        'status', 'payment_method', 'payment_status', 'coupon_code', 'notes',
        'cancellation_reason', 'confirmed_at', 'processing_at', 'shipped_at', 'delivered_at', 'cancelled_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping_fee' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'confirmed_at' => 'datetime',
        'processing_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function items() { return $this->hasMany(OrderItem::class); }
    public function payment() { return $this->hasOne(Payment::class); }
    public function coupon() { return $this->belongsTo(Coupon::class); }
    public function shippingZone() { return $this->belongsTo(ShippingZone::class); }

    public static function generateOrderNumber(): string
    {
        return 'SP' . strtoupper(uniqid());
    }
}
