<?php

namespace Database\Factories;

use App\Domains\Finance\Models\Account;
use App\Models\User;
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
            'user_id' => User::factory(),
            'created_by' => null,
        ];
    }

    public function configure()
    {
        return $this->afterMaking(function (Account $account): void {
            if (!$account->created_by) {
                $account->created_by = $account->user_id;
            }
        })->afterCreating(function (Account $account): void {
            if (!$account->created_by) {
                $account->created_by = $account->user_id;
                $account->save();
            }
        });
    }
}
