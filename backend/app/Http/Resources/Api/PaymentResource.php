<?php
namespace App\Http\Resources\Api;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource {
    public function toArray($request): array {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'gateway' => $this->gateway,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'status' => $this->status,
            'channel' => $this->channel,
            'paid_at' => $this->paid_at,
        ];
    }
}
