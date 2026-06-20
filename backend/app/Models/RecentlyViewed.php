<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecentlyViewed extends Model
{
    public $timestamps = false;

    protected $fillable = ['user_id', 'product_id', 'viewed_at'];

    protected $casts = ['viewed_at' => 'datetime'];

    public function product() { return $this->belongsTo(Product::class); }
}
