<?php
namespace App\Http\Requests\Api;
use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'address_id' => 'required|exists:addresses,id',
            'payment_method' => 'required|in:paystack,cash_on_delivery',
            'coupon_code' => 'nullable|string|exists:coupons,code',
            'notes' => 'nullable|string|max:500',
        ];
    }
}
