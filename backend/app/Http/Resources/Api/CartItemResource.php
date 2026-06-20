<?php
namespace App\Http\Resources\Api;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource {
    public function toArray($request): array {
        return [
            'id' => $this->id,
            'product' => new ProductResource($this->whenLoaded('product')),
            'variant' => new ProductVariantResource($this->whenLoaded('variant')),
            'quantity' => $this->quantity,
            'price' => (float) $this->price,
            'subtotal' => (float) $this->subtotal,
        ];
    }
}
