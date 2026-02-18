<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RentableBooking extends Model
{
    protected $fillable = [
        'user_id', 'rentable_item_id', 'user_name', 'user_phone',
        'booking_details', 'documents', 'status', 'total_price'
    ];

    protected $casts = [
        'booking_details' => 'array',
        'documents' => 'array',
        'total_price' => 'decimal:2'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function item()
    {
        return $this->belongsTo(RentableItem::class, 'rentable_item_id');
    }
}
