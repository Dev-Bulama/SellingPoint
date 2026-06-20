<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id', 'name', 'value', 'sku',
        'price_modifier', 'stock_quantity', 'image', 'is_active',
    ];

    protected $casts = ['price_modifier' => 'decimal:2', 'is_active' => 'boolean'];

    public function product() { return $this->belongsTo(Product::class); }
}
