<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RidePool extends Model
{
    protected $fillable = [
        'pool_custom_id',
        'driver_id',
        'riders',
        'route_overlap',
        'detour_distance',
        'savings_per_rider',
        'eta_minutes',
        'status',
        'total_seats',
        'allocation_strategy',
        'capacity_confirmed',
    ];

    protected $casts = [
        'riders' => 'array',
        'savings_per_rider' => 'decimal:2',
        'capacity_confirmed' => 'boolean',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}
