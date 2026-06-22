<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id', 'brand_id', 'name', 'slug', 'sku',
        'short_description', 'description', 'specifications',
        'price', 'discount_price', 'stock_quantity', 'min_stock_alert',
        'weight', 'thumbnail', 'status', 'is_featured', 'is_flash_sale',
        'is_new_arrival', 'is_best_seller', 'is_sponsored',
        'average_rating', 'review_count', 'sold_count', 'view_count', 'tags',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'discount_price' => 'decimal:2',
        'specifications' => 'array',
        'tags' => 'array',
        'is_featured' => 'boolean',
        'is_flash_sale' => 'boolean',
        'is_new_arrival' => 'boolean',
        'is_best_seller' => 'boolean',
        'is_sponsored' => 'boolean',
    ];

    public function category() { return $this->belongsTo(Category::class); }
    public function brand() { return $this->belongsTo(Brand::class); }
    public function images() { return $this->hasMany(ProductImage::class)->orderBy('sort_order'); }
    public function variants() { return $this->hasMany(ProductVariant::class); }
    public function reviews() { return $this->hasMany(Review::class)->where('status', 'approved'); }
    public function cartItems() { return $this->hasMany(CartItem::class); }
    public function wishlistItems() { return $this->hasMany(Wishlist::class); }
    public function orderItems() { return $this->hasMany(OrderItem::class); }

    public function getThumbnailUrlAttribute(): ?string
    {
        if (!$this->thumbnail) return null;
        if (str_starts_with($this->thumbnail, 'http')) return $this->thumbnail;
        $base = request()->getSchemeAndHttpHost();
        return $base . '/storage/' . ltrim($this->thumbnail, '/');
    }

    public function getEffectivePriceAttribute(): float
    {
        return $this->discount_price ?? $this->price;
    }

    public function getDiscountPercentageAttribute(): int
    {
        if (!$this->discount_price) return 0;
        return (int) round((($this->price - $this->discount_price) / $this->price) * 100);
    }

    public function scopeActive($query) { return $query->where('status', 'active'); }
    public function scopeFeatured($query) { return $query->where('is_featured', true); }
    public function scopeInStock($query) { return $query->where('stock_quantity', '>', 0); }
}
