<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $cartItem = $this->route('cartItem');

        return [
            'quantity' => ['required', 'integer', 'min:1', 'max:'.($cartItem?->product?->stock ?? 0)],
        ];
    }
}