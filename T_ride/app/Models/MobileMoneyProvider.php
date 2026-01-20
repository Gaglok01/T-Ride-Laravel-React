<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MobileMoneyProvider extends Model
{
    protected $fillable = [
        'payment_provider_id',
        'name',
        'country',
        'api_status',
        'transaction_limit',
        'fee_percentage',
        'today_volume',
        'transaction_count',
        'is_active'
    ];

    protected $casts = [
        'transaction_limit' => 'decimal:2',
        'fee_percentage' => 'decimal:2',
        'today_volume' => 'decimal:2',
        'is_active' => 'boolean'
    ];

    public function paymentProvider(): BelongsTo
    {
        return $this->belongsTo(PaymentProvider::class);
    }
}
