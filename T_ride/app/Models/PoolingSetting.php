<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PoolingSetting extends Model
{
    protected $guarded = [];

    protected $casts = [
        'no_match_guarantee' => 'boolean',
        'is_pooling_enabled' => 'boolean',
        'auto_match_riders' => 'boolean',
        'allow_cross_zone' => 'boolean',
        'surge_pooling' => 'boolean',
        'gender_preference' => 'boolean',
        'min_rating_filter' => 'float',
    ];
}
