<?php
namespace App\Http\Resources\Api;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource {
    public function toArray($request): array {
        return [
            'id' => $this->id,
            'user' => ['id' => $this->user->id, 'name' => $this->user->name, 'avatar_url' => $this->user->avatar_url],
            'rating' => $this->rating,
            'title' => $this->title,
            'body' => $this->body,
            'images' => $this->images ? array_map(fn($img) => asset('storage/' . $img), $this->images) : [],
            'admin_reply' => $this->admin_reply,
            'is_verified_purchase' => $this->is_verified_purchase,
            'helpful_count' => $this->helpful_count,
            'created_at' => $this->created_at,
        ];
    }
}
