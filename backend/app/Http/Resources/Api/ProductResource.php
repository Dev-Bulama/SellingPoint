<?php
namespace App\Http\Resources\Api;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource {
    public function toArray($request): array {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'short_description' => $this->short_description,
            'description' => $this->when($request->routeIs('api.products.show'), $this->description),
            'specifications' => $this->when($request->routeIs('api.products.show'), $this->specifications),
            'price' => (float) $this->price,
            'discount_price' => $this->discount_price ? (float) $this->discount_price : null,
            'effective_price' => (float) $this->effective_price,
            'discount_percentage' => $this->discount_percentage,
            'stock_quantity' => $this->stock_quantity,
            'in_stock' => $this->stock_quantity > 0,
            'thumbnail_url' => $this->thumbnail_url,
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'brand' => new BrandResource($this->whenLoaded('brand')),
            'average_rating' => (float) $this->average_rating,
            'review_count' => $this->review_count,
            'sold_count' => $this->sold_count,
            'is_featured' => $this->is_featured,
            'is_flash_sale' => $this->is_flash_sale,
            'is_new_arrival' => $this->is_new_arrival,
            'is_best_seller' => $this->is_best_seller,
            'tags' => $this->tags ?? [],
            'created_at' => $this->created_at,
        ];
    }
}
