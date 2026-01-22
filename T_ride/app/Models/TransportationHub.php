<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransportationHub extends Model
{
    protected $fillable = [
        'city_id',
        'name',
        'type',
        'pickup_fee',
        'queue_capacity',
        'coordinates',
        'status'
    ];

    protected $casts = [
        'coordinates' => 'array',
        'pickup_fee' => 'decimal:2',
    ];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }
}
