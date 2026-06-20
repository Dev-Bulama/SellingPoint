<?php
namespace App\Http\Resources\Api;
use Illuminate\Http\Resources\Json\JsonResource;

class BannerResource extends JsonResource {
    public function toArray($request): array {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'image_url' => $this->image_url,
            'link' => $this->link,
            'type' => $this->type,
            'button_text' => $this->button_text,
            'bg_color' => $this->bg_color,
        ];
    }
}
