<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PackagePricing extends Model
{
    protected $table = 'package_pricing';

    protected $fillable = [
        'package_type',
        'base_price',
        'per_km',
        'status'
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'per_km' => 'decimal:2',
    ];
}
