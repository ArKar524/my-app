<?php

namespace App\Domains\Finance\Models;

use App\Domains\Finance\Enums\TransactionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'account_id',
        'to_account_id',
        'category_id',
        'type',
        'amount',
        'description',
        'occurred_at',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'occurred_at' => 'date',
        'type' => TransactionType::class,
    ];

    protected static function booted(): void
    {
        static::creating(function (Transaction $transaction): void {
            if (!$transaction->created_by && Auth::id()) {
                $transaction->created_by = Auth::id();
            }
            if (!$transaction->user_id && Auth::id()) {
                $transaction->user_id = Auth::id();
            }
        });
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function toAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'to_account_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    protected static function newFactory()
    {
        return \Database\Factories\TransactionFactory::new();
    }
}
