<?php

namespace Database\Factories;

use App\Domains\Finance\Models\Account;
use Illuminate\Database\Eloquent\Factories\Factory;

class AccountFactory extends Factory
{
    protected $model = Account::class;

    public function definition(): array
    {
        $opening = $this->faker->randomFloat(2, 0, 5000);

        return [
            'name' => $this->faker->company . ' Account',
            'type' => $this->faker->randomElement(['cash', 'bank', 'general']),
            'currency_code' => 'USD',
            'opening_balance' => $opening,
            'current_balance' => $opening,
            'created_by' => null,
        ];
    }
}
