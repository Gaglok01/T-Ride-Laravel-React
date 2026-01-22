<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommissionTier extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'name',
        'min_threshold',
        'max_threshold',
        'rate',
        'description'
    ];

    protected $casts = [
        'rate' => 'decimal:2',
    ];
}
