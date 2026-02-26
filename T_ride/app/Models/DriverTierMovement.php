<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DriverTierMovement extends Model
{
    protected $fillable = [
        'driver_id',
        'from_tier',
        'to_tier',
        'reason',
        'direction',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}
