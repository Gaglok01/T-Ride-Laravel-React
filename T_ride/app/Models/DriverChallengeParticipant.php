<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DriverChallengeParticipant extends Model
{
    protected $fillable = [
        'driver_id',
        'challenge_id',
        'joined_at',
        'completed_at',
        'claimed_at',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
        'completed_at' => 'datetime',
        'claimed_at' => 'datetime',
    ];
}
