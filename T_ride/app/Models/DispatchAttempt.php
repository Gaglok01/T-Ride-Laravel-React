<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DispatchAttempt extends Model
{
    protected $fillable = [
        'order_type',
        'order_id',
        'driver_id',
        'attempt_number',
        'status',
        'cooldown_until',
    ];

    protected $casts = [
        'cooldown_until' => 'datetime',
        'attempt_number' => 'integer',
    ];

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }
}
