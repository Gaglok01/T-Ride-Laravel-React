<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RestrictedArea extends Model
{
    protected $fillable = [
        'city_id',
        'name',
        'restriction_type',
        'reason',
        'effective_period',
        'boundaries',
        'status'
    ];

    protected $casts = [
        'boundaries' => 'array',
    ];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }
}
