<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DispatchZone extends Model
{
    protected $fillable = [
        'name',
        'type',
        'center_lat',
        'center_lng',
        'radius_meters',
        'surge_multiplier',
        'is_active',
    ];

    protected $casts = [
        'center_lat' => 'float',
        'center_lng' => 'float',
        'radius_meters' => 'integer',
        'surge_multiplier' => 'float',
        'is_active' => 'boolean',
    ];
}
