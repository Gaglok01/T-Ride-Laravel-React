<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentQueueItem extends Model
{
    protected $table = 'document_queue';

    protected $fillable = [
        'driver_id',
        'document_type',
        'file_path',
        'city',
        'status',
        'rejection_reason'
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}
