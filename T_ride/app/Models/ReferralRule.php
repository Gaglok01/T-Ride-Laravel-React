<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReferralRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'trigger_event',
        'reward_type',
        'reward_amount',
        'is_active',
        'description',
    ];

    protected $casts = [
        'reward_amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}
