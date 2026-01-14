<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ride extends Model
{
    protected $fillable = [
        'ride_custom_id',
        'rider_id',
        'driver_id',
        'pickup_address',
        'dropoff_address',
        'fare',
        'payment_method',
        'payment_status',
        'status',
        'started_at',
        'completed_at'
    ];

    protected $casts = [
        'fare' => 'decimal:2',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function rider()
    {
        return $this->belongsTo(User::class, 'rider_id');
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class, 'driver_id');
    }
}
