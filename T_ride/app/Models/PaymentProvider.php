<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentProvider extends Model
{
    protected $fillable = [
        'name',
        'type',
        'api_key',
        'secret_key',
        'credentials',
        'country',
        'transaction_fee',
        'transaction_limit',
        'success_rate',
        'is_active',
        'status',
        'transaction_count',
        'total_processed'
    ];

    protected $casts = [
        'credentials' => 'array',
        'is_active' => 'boolean',
        'transaction_fee' => 'decimal:2',
        'transaction_limit' => 'decimal:2',
        'total_processed' => 'decimal:2'
    ];

    public function mobileMoneyProviders(): HasMany
    {
        return $this->hasMany(MobileMoneyProvider::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }
}

