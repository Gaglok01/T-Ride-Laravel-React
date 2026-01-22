<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommissionEarning extends Model
{
    use HasFactory;

    protected $fillable = [
        'period',
        'period_date',
        'rides_revenue',
        'delivery_revenue',
        'courier_revenue',
        'total_revenue',
        'commission_earned',
        'avg_rate',
        'growth_percentage'
    ];

    protected $casts = [
        'period_date' => 'date',
        'rides_revenue' => 'decimal:2',
        'delivery_revenue' => 'decimal:2',
        'courier_revenue' => 'decimal:2',
        'total_revenue' => 'decimal:2',
        'commission_earned' => 'decimal:2',
        'avg_rate' => 'decimal:2',
        'growth_percentage' => 'decimal:2',
    ];
}
