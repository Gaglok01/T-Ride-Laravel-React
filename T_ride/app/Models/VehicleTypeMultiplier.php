<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleTypeMultiplier extends Model
{
    protected $fillable = [
        'pricing_zone_id',
        'vehicle_type',
        'multiplier'
    ];

    protected $casts = [
        'multiplier' => 'decimal:2',
    ];

    public function pricingZone(): BelongsTo
    {
        return $this->belongsTo(PricingZone::class);
    }
}
