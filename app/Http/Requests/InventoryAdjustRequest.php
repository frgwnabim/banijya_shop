<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InventoryAdjustRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'quantity_change' => ['required', 'integer', 'not_in:0'],
            'type' => ['required', Rule::in(['restock', 'adjustment', 'return'])],
            'note' => ['required', 'string', 'max:1000'],
        ];
    }
}
