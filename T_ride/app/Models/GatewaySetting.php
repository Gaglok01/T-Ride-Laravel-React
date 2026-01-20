<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GatewaySetting extends Model
{
    protected $fillable = [
        'setting_name',
        'value',
        'description',
        'setting_type',
        'is_enabled'
    ];

    protected $casts = [
        'is_enabled' => 'boolean'
    ];
}
