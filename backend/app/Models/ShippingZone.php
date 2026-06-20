<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingZone extends Model
{
    protected $fillable = [
        'name', 'states', 'base_fee', 'free_shipping_threshold',
        'estimated_days_min', 'estimated_days_max', 'is_active',
    ];

    protected $casts = [
        'states' => 'array',
        'base_fee' => 'decimal:2',
        'free_shipping_threshold' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function getShippingFee(float $orderTotal): float
    {
        if ($this->free_shipping_threshold && $orderTotal >= $this->free_shipping_threshold) {
            return 0;
        }
        return $this->base_fee;
    }
}
