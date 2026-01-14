<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    protected $fillable = [
        'code',
        'type',
        'value',
        'current_uses',
        'max_uses',
        'valid_until',
        'status',
        'total_discount_given'
    ];

    protected $casts = [
        'valid_until' => 'date',
        'value' => 'decimal:2',
    ];

    public function isValid()
    {
        return $this->status === 'active'
            && $this->valid_until >= now()
            && ($this->max_uses === null || $this->current_uses < $this->max_uses);
    }
}
