<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceZone extends Model
{
    protected $fillable = [
        'city_id',
        'name',
        'description',
        'boundaries',
        'price_multiplier',
        'status'
    ];

    protected $casts = [
        'boundaries' => 'array',
        'price_multiplier' => 'decimal:2',
    ];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }
}
