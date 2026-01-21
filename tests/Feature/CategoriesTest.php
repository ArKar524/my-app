<?php

use App\Domains\Finance\Models\Category;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->user = User::factory()->create(['email_verified_at' => now()]);
});

test('categories index loads', function () {
    $response = $this->actingAs($this->user)->get(route('categories.index'));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page->component('Finance/Categories/Index'));
});

test('category can be created', function () {
    $payload = [
        'name' => 'Salary',
        'type' => 'income',
    ];

    $response = $this->actingAs($this->user)->post(route('categories.store'), $payload);

    $response->assertRedirect(route('categories.index'));
    $this->assertDatabaseHas('categories', [
        'name' => 'Salary',
        'type' => 'income',
    ]);
});

test('category can be updated', function () {
    $category = Category::factory()->create(['name' => 'Old', 'type' => 'expense', 'created_by' => $this->user->id]);

    $response = $this->actingAs($this->user)->put(route('categories.update', $category), [
        'name' => 'New',
        'type' => 'income',
    ]);

    $response->assertRedirect(route('categories.index'));
    $this->assertDatabaseHas('categories', [
        'id' => $category->id,
        'name' => 'New',
        'type' => 'income',
    ]);
});

test('category can be deleted', function () {
    $category = Category::factory()->create(['created_by' => $this->user->id]);

    $response = $this->actingAs($this->user)->delete(route('categories.destroy', $category));

    $response->assertRedirect(route('categories.index'));
    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});
