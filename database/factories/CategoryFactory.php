<?php

namespace Database\Factories;

use App\Domains\Finance\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->word(),
            'type' => $this->faker->randomElement(['income', 'expense']),
            'user_id' => User::factory(),
            'created_by' => null,
        ];
    }

    public function configure()
    {
        return $this->afterMaking(function (Category $category): void {
            if (!$category->created_by) {
                $category->created_by = $category->user_id;
            }
        })->afterCreating(function (Category $category): void {
            if (!$category->created_by) {
                $category->created_by = $category->user_id;
                $category->save();
            }
        });
    }
}
