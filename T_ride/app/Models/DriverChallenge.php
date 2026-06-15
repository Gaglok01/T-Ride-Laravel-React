<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DriverChallenge extends Model
{
    protected $fillable = [
        'title',
        'description',
        'reward_amount',
        'challenge_type',
        'target_value',
        'service_type',
        'type_id',
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
