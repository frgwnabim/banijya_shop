<?php

namespace App\Http\Requests;

use App\Services\OrderService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(OrderService::statuses())],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
