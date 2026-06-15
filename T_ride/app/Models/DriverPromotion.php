<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DriverPromotion extends Model
{
    protected $fillable = [
        'title',
        'description',
        'reward_amount',
        'target_rides',
        'service_type',
        'city',
        'starts_at',
        'ends_at',
        'status',
    ];

    protected $casts = [
        'reward_amount' => 'decimal:2',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];
}
