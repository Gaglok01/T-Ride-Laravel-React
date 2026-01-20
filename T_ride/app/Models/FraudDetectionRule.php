<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FraudDetectionRule extends Model
{
    protected $fillable = [
        'rule_name',
        'rule_type',
        'rule_condition',
        'risk_score',
        'action',
        'is_active'
    ];

    protected $casts = [
        'rule_condition' => 'array',
        'is_active' => 'boolean'
    ];
}
