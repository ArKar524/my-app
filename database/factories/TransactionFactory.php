<?php

namespace Database\Factories;

use App\Domains\Finance\Enums\TransactionType;
use App\Domains\Finance\Models\Account;
use App\Domains\Finance\Models\Category;
use App\Domains\Finance\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        $user = User::factory()->create();
        $account = Account::factory()->create(['created_by' => $user->id]);
        $category = Category::factory()->create([
            'created_by' => $user->id,
            'type' => 'expense',
        ]);

        return [
            'user_id' => $user->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
            'type' => TransactionType::Expense,
            'amount' => $this->faker->randomFloat(2, 5, 200),
            'description' => $this->faker->sentence,
            'occurred_at' => now()->toDateString(),
            'created_by' => $user->id,
        ];
    }
}
