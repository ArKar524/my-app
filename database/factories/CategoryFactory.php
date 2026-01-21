<?php

namespace Database\Factories;

use App\Domains\Finance\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->word(),
            'type' => $this->faker->randomElement(['income', 'expense']),
            'created_by' => null,
        ];
    }
}
