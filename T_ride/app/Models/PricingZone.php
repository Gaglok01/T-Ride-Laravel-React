<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PricingZone extends Model
{
    protected $fillable = [
        'zone_id',
        'name',
        'description',
        'base_fare',
        'per_km',
        'per_minute',
        'min_fare',
        'status'
    ];

    protected $casts = [
        'base_fare' => 'decimal:2',
        'per_km' => 'decimal:2',
        'per_minute' => 'decimal:2',
        'min_fare' => 'decimal:2',
    ];

    public function vehicleMultipliers(): HasMany
    {
        return $this->hasMany(VehicleTypeMultiplier::class);
    }
}
