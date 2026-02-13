<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ride extends Model
{
    protected $fillable = [
        'ride_custom_id',
        'rider_id',
        'driver_id',
        'vehicle_type_id',
        'pickup_address',
        'pickup_lat',
        'pickup_lng',
        'dropoff_address',
        'dropoff_lat',
        'dropoff_lng',
        'fare',
        'payment_method',
        'payment_status',
        'status',
        'rating',
        'comment',
        'started_at',
        'completed_at',
        // Courier fields
        'receiver_name',
        'receiver_phone',
        'package_size',
        'package_weight',
        'package_photo',
        'pickup_instructions',
        'dropoff_instructions',
        'service_type',
        'delivery_signature',
        'proof_of_delivery',
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

    public function vehicleType()
    {
        return $this->belongsTo(Type::class, 'vehicle_type_id');
    }
}
