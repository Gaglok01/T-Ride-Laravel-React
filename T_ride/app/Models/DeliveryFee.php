<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryFee extends Model
{
    protected $fillable = [
        'name',
        'description',
        'base_fee',
        'per_km',
        'min_order',
        'free_delivery_threshold',
        'status'
    ];

    protected $casts = [
        'base_fee' => 'decimal:2',
        'per_km' => 'decimal:2',
        'min_order' => 'decimal:2',
        'free_delivery_threshold' => 'decimal:2',
    ];
}
