<?php

use App\Domains\Finance\Models\Account;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->user = User::factory()->create(['email_verified_at' => now()]);
});

test('accounts index loads', function () {
    $response = $this->actingAs($this->user)->get(route('accounts.index'));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page->component('Finance/Accounts/Index'));
});

test('account can be created', function () {
    $payload = [
        'name' => 'Cash',
        'type' => 'cash',
        'currency_code' => 'USD',
        'opening_balance' => 100,
    ];

    $response = $this->actingAs($this->user)->post(route('accounts.store'), $payload);

    $response->assertRedirect(route('accounts.index'));
    $this->assertDatabaseHas('accounts', [
        'name' => 'Cash',
        'type' => 'cash',
        'currency_code' => 'USD',
    ]);
});

test('account can be updated', function () {
    $account = Account::factory()->create([
        'name' => 'Old Name',
        'user_id' => $this->user->id,
        'created_by' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)->put(route('accounts.update', $account), [
        'name' => 'New Name',
        'type' => 'bank',
        'currency_code' => 'USD',
    ]);

    $response->assertRedirect(route('accounts.index'));
    $this->assertDatabaseHas('accounts', [
        'id' => $account->id,
        'name' => 'New Name',
        'type' => 'bank',
    ]);
});

test('account can be deleted', function () {
    $account = Account::factory()->create([
        'user_id' => $this->user->id,
        'created_by' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)->delete(route('accounts.destroy', $account));

    $response->assertRedirect(route('accounts.index'));
    $this->assertDatabaseMissing('accounts', ['id' => $account->id]);
});
