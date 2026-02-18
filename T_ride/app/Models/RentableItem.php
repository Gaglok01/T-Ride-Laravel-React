<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RentableItem extends Model
{
    protected $fillable = [
        'name', 'category', 'description', 'price', 'price_unit', 
        'location', 'images', 'features', 'status'
    ];

    protected $casts = [
        'images' => 'array',
        'features' => 'array',
        'price' => 'decimal:2'
    ];

    public function bookings()
    {
        return $this->hasMany(RentableBooking::class);
    }
}
