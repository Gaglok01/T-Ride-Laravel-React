<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebhookConfiguration extends Model
{
    protected $fillable = [
        'name',
        'url',
        'event_type',
        'status',
        'secret',
        'retry_count',
        'last_triggered_at'
    ];

    protected $casts = [
        'last_triggered_at' => 'datetime'
    ];
}
