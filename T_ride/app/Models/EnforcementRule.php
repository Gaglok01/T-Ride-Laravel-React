<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnforcementRule extends Model
{
    protected $fillable = [
        'label',
        'enabled',
        'rule_key'
    ];

    protected $casts = [
        'enabled' => 'boolean'
    ];
}
