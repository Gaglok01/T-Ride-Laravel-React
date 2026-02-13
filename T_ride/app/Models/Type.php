<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Type extends Model
{
    use HasFactory;

    protected $fillable = [
        'type_custom_id',
        'type_name',
        'description',
        'capacity',
        'max_weight',
        'photo',
        'service_type',
        'status',
    ];
}
