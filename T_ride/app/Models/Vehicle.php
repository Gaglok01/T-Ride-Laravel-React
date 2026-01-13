<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = [
        'name', 'year', 'vin', 'plate_number',
        'type', 'daily_rate', 'status'
    ];
    
    public function maintenances()
    {
        return $this->hasMany(VehicleMaintenance::class);
    }
    
    public function rentals()
    {
        return $this->hasMany(Rental::class);
    }

    public function activeRental() {
        return $this->hasOne(Rental::class)->where('status', 'active')->latest();
    }
}
