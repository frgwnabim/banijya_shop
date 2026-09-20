<?php

namespace App\Http\Requests;

use App\Models\Discount;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminDiscountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('code')) {
            $this->merge(['code' => strtoupper(trim((string) $this->input('code')))]);
        }
    }

    public function rules(): array
    {
        $discount = $this->route('discount');

        return [
            'code' => ['required', 'string', 'max:50', Rule::unique(Discount::class, 'code')->ignore($discount)],
            'type' => ['required', Rule::in(['percentage', 'fixed'])],
            'value' => [
                'required',
                'numeric',
                function ($attribute, $value, $fail) {
                    if ($this->input('type') === 'percentage' && ($value < 1 || $value > 100)) {
                        $fail('Value untuk tipe percentage harus di antara 1-100.');
                    }

                    if ($this->input('type') === 'fixed' && $value <= 0) {
                        $fail('Value untuk tipe fixed harus lebih dari 0.');
                    }
                },
            ],
            'min_purchase' => ['nullable', 'numeric', 'min:0'],
            'starts_at' => ['required', 'date'],
            'expires_at' => ['required', 'date', 'after:starts_at'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
