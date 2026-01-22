<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommissionRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'name',
        'base_rate',
        'min_commission',
        'max_commission',
        'surge_multiplier',
        'attributes',
        'city_id',
        'status'
    ];

    protected $casts = [
        'base_rate' => 'decimal:2',
        'min_commission' => 'decimal:2',
        'max_commission' => 'decimal:2',
        'attributes' => 'array',
        'status' => 'string'
    ];

    public function city()
    {
        return $this->belongsTo(City::class);
    }
}
