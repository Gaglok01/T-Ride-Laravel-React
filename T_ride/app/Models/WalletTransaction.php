<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    protected $fillable = [
        'user_id', 'amount', 'balance_before', 'balance_after',
        'type', 'transaction_type', 'status', 'description', 'reference_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
