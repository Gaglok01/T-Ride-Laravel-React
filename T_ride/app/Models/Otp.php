<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Otp extends Model
{
    protected $table = 'otps';
    protected $fillable = [
        'identifier',
        'otp',
        'expires_at',
        'is_used',
    ];
}
