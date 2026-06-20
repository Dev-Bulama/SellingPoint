<?php
namespace App\Http\Requests\Api;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'name' => 'sometimes|string|max:100',
            'phone' => ['sometimes', 'string', 'max:20', Rule::unique('users')->ignore($this->user()->id)],
            'gender' => 'sometimes|in:male,female,other',
            'date_of_birth' => 'sometimes|date|before:today',
            'avatar' => 'sometimes|image|max:2048',
        ];
    }
}
