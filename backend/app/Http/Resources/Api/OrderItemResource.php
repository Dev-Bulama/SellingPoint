<?php
namespace App\Http\Resources\Api;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource {
    public function toArray($request): array {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_name' => $this->product_name,
            'product_image' => $this->product_image ? asset('storage/' . $this->product_image) : null,
            'variant_name' => $this->variant_name,
            'quantity' => $this->quantity,
            'unit_price' => (float) $this->unit_price,
            'total_price' => (float) $this->total_price,
        ];
    }
}
