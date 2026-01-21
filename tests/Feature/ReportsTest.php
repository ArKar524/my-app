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

test('reports aggregate daily, monthly, and category totals', function () {
    $this->actingAs($this->user);

    $this->service->create([
        'type' => TransactionType::Income,
        'account_id' => $this->accounts[0]->id,
        'category_id' => $this->incomeCategory->id,
        'amount' => 100,
        'description' => 'Jan income',
        'occurred_at' => '2024-01-01',
    ]);

    $this->service->create([
        'type' => TransactionType::Expense,
        'account_id' => $this->accounts[0]->id,
        'category_id' => $this->expenseCategory->id,
        'amount' => 40,
        'description' => 'Jan expense',
        'occurred_at' => '2024-01-01',
    ]);

    $this->service->create([
        'type' => TransactionType::Transfer,
        'account_id' => $this->accounts[0]->id,
        'to_account_id' => $this->accounts[1]->id,
        'amount' => 25,
        'description' => 'Transfer out',
        'occurred_at' => '2024-01-02',
    ]);

    $this->service->create([
        'type' => TransactionType::Income,
        'account_id' => $this->accounts[0]->id,
        'category_id' => $this->incomeCategory->id,
        'amount' => 50,
        'description' => 'Feb income',
        'occurred_at' => '2024-02-05',
    ]);

    $response = $this->actingAs($this->user)->get(route('reports.index'));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Finance/Reports/Index')
        ->where('daily.0.date', '2024-01-01')
        ->where('daily.0.income', 100)
        ->where('daily.0.expense', 40)
        ->where('daily.0.net', 60)
        ->where('monthly.0.month', '2024-01')
        ->where('monthly.0.net', 35)
        ->where('categoryTotals.0.category_name', $this->incomeCategory->name)
    );
});

test('reports account filter tracks transfer direction', function () {
    $this->actingAs($this->user);

    $this->service->create([
        'type' => TransactionType::Transfer,
        'account_id' => $this->accounts[0]->id,
        'to_account_id' => $this->accounts[1]->id,
        'amount' => 25,
        'description' => 'Transfer out',
        'occurred_at' => '2024-01-02',
    ]);

    $response = $this->actingAs($this->user)->get(route('reports.index', [
        'account_id' => $this->accounts[1]->id,
    ]));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('daily.0.transfer_in', 25)
        ->where('daily.0.transfer_out', 0)
        ->where('daily.0.net', 25)
    );
});
