<?php

use App\Domains\Finance\Enums\TransactionType;
use App\Domains\Finance\Models\Account;
use App\Domains\Finance\Models\Category;
use App\Domains\Finance\Services\TransactionService;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->user = User::factory()->create(['email_verified_at' => now()]);
    $this->accounts = Account::factory()->count(2)->create([
        'user_id' => $this->user->id,
        'created_by' => $this->user->id,
    ]);
    $this->accounts->each(function (Account $account) {
        $account->update(['opening_balance' => 0, 'current_balance' => 0]);
    });
    $this->incomeCategory = Category::factory()->create([
        'type' => 'income',
        'created_by' => $this->user->id,
        'user_id' => $this->user->id,
    ]);
    $this->expenseCategory = Category::factory()->create([
        'type' => 'expense',
        'created_by' => $this->user->id,
        'user_id' => $this->user->id,
    ]);
    $this->service = app(TransactionService::class);
});

test('account statement shows running balance and summary', function () {
    $this->actingAs($this->user);

    $this->service->create([
        'type' => TransactionType::Income,
        'account_id' => $this->accounts[0]->id,
        'category_id' => $this->incomeCategory->id,
        'amount' => 100,
        'description' => 'Paycheck',
        'occurred_at' => '2024-01-01',
    ]);

    $this->service->create([
        'type' => TransactionType::Expense,
        'account_id' => $this->accounts[0]->id,
        'category_id' => $this->expenseCategory->id,
        'amount' => 40,
        'description' => 'Groceries',
        'occurred_at' => '2024-01-02',
    ]);

    $this->service->create([
        'type' => TransactionType::Transfer,
        'account_id' => $this->accounts[0]->id,
        'to_account_id' => $this->accounts[1]->id,
        'amount' => 25,
        'description' => 'Move to savings',
        'occurred_at' => '2024-01-03',
    ]);

    $response = $this->actingAs($this->user)->get(route('accounts.statement', $this->accounts[0]));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Finance/Accounts/Statement')
        ->where('summary.income', 100)
        ->where('summary.expense', 40)
        ->where('summary.transfer_out', 25)
        ->where('summary.transfer_in', 0)
        ->where('ending_balance', 35)
        ->has('transactions', 3)
        ->where('transactions.0.running_balance', 100)
        ->where('transactions.1.running_balance', 60)
        ->where('transactions.2.running_balance', 35)
    );
});

test('account statement honors date filters and starting balance', function () {
    $this->actingAs($this->user);

    $this->service->create([
        'type' => TransactionType::Income,
        'account_id' => $this->accounts[0]->id,
        'category_id' => $this->incomeCategory->id,
        'amount' => 50,
        'description' => 'Earlier income',
        'occurred_at' => '2023-12-01',
    ]);

    $this->service->create([
        'type' => TransactionType::Income,
        'account_id' => $this->accounts[0]->id,
        'category_id' => $this->incomeCategory->id,
        'amount' => 100,
        'description' => 'New month income',
        'occurred_at' => '2024-01-02',
    ]);

    $response = $this->actingAs($this->user)->get(route('accounts.statement', [
        'account' => $this->accounts[0]->id,
        'start_date' => '2024-01-01',
    ]));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('starting_balance', 50)
        ->where('ending_balance', 150)
        ->has('transactions', 1)
        ->where('transactions.0.description', 'New month income')
        ->where('summary.income', 100)
    );
});
