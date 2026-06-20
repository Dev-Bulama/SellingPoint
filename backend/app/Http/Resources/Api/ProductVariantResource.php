<?php
namespace App\Http\Resources\Api;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource {
    public function toArray($request): array {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'value' => $this->value,
            'sku' => $this->sku,
            'price_modifier' => (float) $this->price_modifier,
            'stock_quantity' => $this->stock_quantity,
            'is_active' => $this->is_active,
        ];
    }
}
