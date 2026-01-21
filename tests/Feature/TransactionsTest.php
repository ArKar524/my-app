<?php

use App\Domains\Finance\Enums\TransactionType;
use App\Domains\Finance\Models\Account;
use App\Domains\Finance\Models\Category;
use App\Domains\Finance\Models\Transaction;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->user = User::factory()->create(['email_verified_at' => now()]);
    $this->accounts = Account::factory()->count(2)->create([
        'user_id' => $this->user->id,
        'created_by' => $this->user->id,
    ]);
    $this->accounts->each(function ($account) {
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
});

test('transactions index loads', function () {
    $response = $this->actingAs($this->user)->get(route('transactions.index'));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page->component('Finance/Transactions/Index'));
});

test('income transaction creates balance', function () {
    $payload = [
        'type' => TransactionType::Income->value,
        'account_id' => $this->accounts[0]->id,
        'category_id' => $this->incomeCategory->id,
        'amount' => 100,
        'description' => 'Salary',
        'occurred_at' => now()->toDateString(),
    ];

    $response = $this->actingAs($this->user)->post(route('transactions.store'), $payload);

    $response->assertRedirect(route('transactions.index'));
    $this->assertDatabaseHas('transactions', ['description' => 'Salary']);
    $this->assertEquals(100, $this->accounts[0]->fresh()->current_balance);
});

test('expense transaction reduces balance', function () {
    $account = $this->accounts[0];
    $account->update(['current_balance' => 200]);

    $payload = [
        'type' => TransactionType::Expense->value,
        'account_id' => $account->id,
        'category_id' => $this->expenseCategory->id,
        'amount' => 50,
        'description' => 'Purchase',
        'occurred_at' => now()->toDateString(),
    ];

    $this->actingAs($this->user)->post(route('transactions.store'), $payload);

    $this->assertEquals(150, $account->fresh()->current_balance);
});

test('transfer transaction moves funds', function () {
    $from = $this->accounts[0];
    $to = $this->accounts[1];
    $from->update(['current_balance' => 500]);
    $to->update(['current_balance' => 100]);

    $payload = [
        'type' => TransactionType::Transfer->value,
        'account_id' => $from->id,
        'to_account_id' => $to->id,
        'amount' => 200,
        'description' => 'Transfer',
        'occurred_at' => now()->toDateString(),
    ];

    $this->actingAs($this->user)->post(route('transactions.store'), $payload);

    $this->assertEquals(300, $from->fresh()->current_balance);
    $this->assertEquals(300, $to->fresh()->current_balance);
});

test('transaction can be updated adjusts balance', function () {
    $account = $this->accounts[0];
    $account->update(['current_balance' => 0]);

    $transaction = Transaction::factory()->create([
        'account_id' => $account->id,
        'category_id' => $this->incomeCategory->id,
        'type' => TransactionType::Income,
        'amount' => 100,
        'user_id' => $this->user->id,
        'created_by' => $this->user->id,
    ]);
    $account->update(['current_balance' => 100]);

    $response = $this->actingAs($this->user)->put(route('transactions.update', $transaction), [
        'type' => TransactionType::Expense->value,
        'account_id' => $account->id,
        'category_id' => $this->expenseCategory->id,
        'amount' => 40,
        'description' => 'Updated',
        'occurred_at' => now()->toDateString(),
    ]);

    $response->assertRedirect(route('transactions.index'));
    $this->assertEquals(-40, $account->fresh()->current_balance);
});

test('transaction can be deleted reverts balance', function () {
    $account = $this->accounts[0];
    $account->update(['current_balance' => 0]);

    $transaction = Transaction::factory()->create([
        'account_id' => $account->id,
        'category_id' => $this->incomeCategory->id,
        'type' => TransactionType::Income,
        'amount' => 75,
        'user_id' => $this->user->id,
        'created_by' => $this->user->id,
    ]);
    $account->update(['current_balance' => 75]);

    $response = $this->actingAs($this->user)->delete(route('transactions.destroy', $transaction));

    $response->assertRedirect(route('transactions.index'));
    $this->assertEquals(0, $account->fresh()->current_balance);
});
