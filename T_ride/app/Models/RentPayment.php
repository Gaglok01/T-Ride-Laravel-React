<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RentPayment extends Model
{
    protected $fillable = [
        'payment_ref', 'rental_id', 'amount',
        'period', 'method', 'status', 'payment_date'
    ];

    public function rental()
    {
        return $this->belongsTo(Rental::class);
    }
}
