<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rental extends Model
{
    protected $fillable = [
        'contract_id', 'driver_id', 'vehicle_id',
        'start_date', 'end_date', 'weekly_rate',
        'outstanding_amount', 'next_payment_date', 'status'
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function payments()
    {
        return $this->hasMany(RentPayment::class);
    }
}
