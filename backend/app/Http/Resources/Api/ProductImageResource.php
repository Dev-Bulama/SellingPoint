<?php
namespace App\Http\Resources\Api;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductImageResource extends JsonResource {
    public function toArray($request): array {
        return [
            'id' => $this->id,
            'image_url' => $this->image_url,
            'is_primary' => $this->is_primary,
            'sort_order' => $this->sort_order,
        ];
    }
}
