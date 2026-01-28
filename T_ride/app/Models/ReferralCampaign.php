<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReferralCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'status',
        'start_date',
        'end_date',
        'budget',
        'spent',
        'description',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'budget' => 'decimal:2',
        'spent' => 'decimal:2',
    ];
}
