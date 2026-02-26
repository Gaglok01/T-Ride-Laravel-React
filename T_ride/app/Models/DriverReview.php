<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DriverReview extends Model
{
    protected $fillable = [
        'trip_id',
        'driver_id',
        'user_id',
        'rating_rd',
        'rating_dr',
        'comment',
        'driver_comment',
        'is_flagged',
        'status',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
