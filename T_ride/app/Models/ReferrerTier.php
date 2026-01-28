<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReferrerTier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'min_referrals',
        'max_referrals',
        'bonus_multiplier',
        'benefits',
        'color',
    ];

    protected $casts = [
        'bonus_multiplier' => 'decimal:2',
        'benefits' => 'array',
    ];
}
