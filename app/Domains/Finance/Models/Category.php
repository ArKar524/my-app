<?php

namespace App\Domains\Finance\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'user_id',
        'created_by',
    ];

    protected static function booted(): void
    {
        static::creating(function (Category $category): void {
            if (!$category->user_id && Auth::id()) {
                $category->user_id = Auth::id();
            }
            if (!$category->created_by && Auth::id()) {
                $category->created_by = Auth::id();
            }
        });
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    protected static function newFactory()
    {
        return \Database\Factories\CategoryFactory::new();
    }
}
