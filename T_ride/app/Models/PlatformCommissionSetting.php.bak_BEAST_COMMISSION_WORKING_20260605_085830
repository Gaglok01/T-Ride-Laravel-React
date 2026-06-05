<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformCommissionSetting extends Model
{
    protected $fillable = [
        'service_type',
        'commission_percent',
        'is_active',
    ];

    protected $casts = [
        'commission_percent' => 'float',
        'is_active' => 'boolean',
    ];

    public static function percentFor(string $serviceType): float
    {
        return (float) static::firstOrCreate(
            ['service_type' => strtolower($serviceType)],
            ['commission_percent' => 20.00, 'is_active' => true]
        )->commission_percent;
    }

    public static function driverSharePercentFor(string $serviceType): float
    {
        return 100 - static::percentFor($serviceType);
    }
}
