<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleMaintenance extends Model
{
    protected $fillable = [
        'vehicle_id', 'issue', 'priority',
        'workshop', 'estimated_cost', 'status', 'due_date'
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
