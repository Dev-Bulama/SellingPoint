<?php
namespace App\Http\Requests\Api;
use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'product_id' => 'required|exists:products,id',
            'order_id' => 'nullable|exists:orders,id',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:150',
            'body' => 'nullable|string|max:1000',
            'images.*' => 'sometimes|image|max:2048',
        ];
    }
}
