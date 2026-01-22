<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExpansionPlan extends Model
{
    protected $fillable = [
        'city_name',
        'country',
        'stage',
        'progress',
        'target_launch_date',
        'notes'
    ];

    protected $casts = [
        'target_launch_date' => 'date',
    ];
}
