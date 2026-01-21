<?php

namespace App\Http\Requests\Finance;

use App\Domains\Finance\Enums\TransactionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'account_id' => ['required', 'exists:accounts,id'],
            'to_account_id' => [
                'nullable',
                'required_if:type,transfer',
                'different:account_id',
                'exists:accounts,id',
            ],
            'category_id' => [
                'nullable',
                Rule::requiredIf(fn () => $this->input('type') !== TransactionType::Transfer->value),
                'exists:categories,id',
            ],
            'type' => ['required', Rule::in(array_column(TransactionType::cases(), 'value'))],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'description' => ['nullable', 'string', 'max:500'],
            'occurred_at' => ['required', 'date'],
        ];
    }
}
