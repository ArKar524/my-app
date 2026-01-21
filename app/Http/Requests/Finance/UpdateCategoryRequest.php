<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $categoryId = $this->route('category')?->id;
        $userId = $this->user()?->id;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories')
                    ->where(fn ($query) => $query->where('created_by', $userId))
                    ->ignore($categoryId),
            ],
            'type' => ['required', Rule::in(['income', 'expense'])],
        ];
    }
}
