<?php

namespace App\Domains\Finance\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

class Account extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'currency_code',
        'opening_balance',
        'current_balance',
        'user_id',
        'created_by',
    ];

    protected $casts = [
        'opening_balance' => 'decimal:2',
        'current_balance' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function (Account $account): void {
            if ($account->current_balance === null) {
                $account->current_balance = $account->opening_balance ?? 0;
            }

            if (!$account->user_id && Auth::id()) {
                $account->user_id = Auth::id();
            }
            if (!$account->created_by && Auth::id()) {
                $account->created_by = Auth::id();
            }
        });
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    protected static function newFactory()
    {
        return \Database\Factories\AccountFactory::new();
    }
}
