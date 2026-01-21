<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('accounts', \App\Http\Controllers\Finance\AccountController::class)
        ->only(['index', 'store', 'update', 'destroy']);
    Route::resource('categories', \App\Http\Controllers\Finance\CategoryController::class)
        ->only(['index', 'store', 'update', 'destroy']);
    Route::get('accounts/{account}/statement', [\App\Http\Controllers\Finance\AccountStatementController::class, 'show'])
        ->name('accounts.statement');
    Route::resource('transactions', \App\Http\Controllers\Finance\TransactionController::class)
        ->only(['index', 'store', 'update', 'destroy']);
    Route::get('reports', [\App\Http\Controllers\Finance\ReportController::class, 'index'])
        ->name('reports.index');
});

require __DIR__.'/auth.php';
