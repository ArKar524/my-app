<?php

use App\Domains\Finance\Enums\TransactionType;
use App\Domains\Finance\Models\Account;
use App\Domains\Finance\Models\Category;
use App\Domains\Finance\Models\Transaction;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create(['email_verified_at' => now()]);
});

test('account actions are logged', function () {
    $this->actingAs($this->user)->post(route('accounts.store'), [
        'name' => 'Checking',
        'type' => 'bank',
        'currency_code' => 'USD',
        'opening_balance' => 0,
    ]);

    $this->assertDatabaseHas('activity_logs', [
        'action' => 'account.created',
        'subject_type' => Account::class,
        'user_id' => $this->user->id,
    ]);
});

test('transaction actions are logged', function () {
    $account = Account::factory()->create(['created_by' => $this->user->id]);
    $category = Category::factory()->create([
        'type' => 'income',
        'created_by' => $this->user->id,
    ]);

    $transaction = Transaction::factory()->create([
        'account_id' => $account->id,
        'category_id' => $category->id,
        'type' => TransactionType::Income,
        'amount' => 10,
        'user_id' => $this->user->id,
        'created_by' => $this->user->id,
    ]);

    $this->actingAs($this->user)->delete(route('transactions.destroy', $transaction));

    $this->assertDatabaseHas('activity_logs', [
        'action' => 'transaction.deleted',
        'subject_id' => $transaction->id,
        'subject_type' => Transaction::class,
    ]);
});
