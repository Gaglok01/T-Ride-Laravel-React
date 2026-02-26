<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DriverTier extends Model
{
    protected $fillable = [
        'name',
        'color',
        'min_rating',
        'min_completion_rate',
        'min_trips_30d',
        'max_cancellations_30d',
        'surge_access',
        'is_stackable',
        'bonus_multiplier',
    ];

    public function drivers()
    {
        return $this->hasMany(Driver::class);
    }
}
