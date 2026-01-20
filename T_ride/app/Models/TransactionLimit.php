<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionLimit extends Model
{
    protected $fillable = [
        'limit_type',
        'amount',
        'currency',
        'applicable_to',
        'is_active'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_active' => 'boolean'
    ];
}
