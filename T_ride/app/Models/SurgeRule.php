<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SurgeRule extends Model
{
    protected $fillable = [
        'name',
        'description',
        'multiplier',
        'start_time',
        'end_time',
        'days',
        'trigger_type',
        'weather_condition',
        'event_name',
        'custom_config',
        'status'
    ];

    protected $casts = [
        'multiplier' => 'decimal:2',
        'days' => 'array',
        'custom_config' => 'array',
    ];
}
