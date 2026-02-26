<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    protected $fillable = [
        'name',
        'country',
        'timezone',
        'currency',
        'services',
        'status',
        'license_renewal',
        'insurance_req',
        'background_freq',
        'vehicle_inspection',
        'min_age'
    ];

    protected $casts = [
        'services' => 'array',
    ];

    public function serviceZones(): HasMany
    {
        return $this->hasMany(ServiceZone::class);
    }

    public function transportationHubs(): HasMany
    {
        return $this->hasMany(TransportationHub::class);
    }

    public function restrictedAreas(): HasMany
    {
        return $this->hasMany(RestrictedArea::class);
    }
}
