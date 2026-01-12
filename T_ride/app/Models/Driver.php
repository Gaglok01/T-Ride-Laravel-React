<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Support\Facades\Storage;
class Driver extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'name',
        'type_id',
        'vehicle_model',
        'trips',
        'rating',
        'status',
        'documents',
        'image',
    ];

    protected $casts = [
        'documents' => 'array',
    ];

    public function type()
    {
        return $this->belongsTo(Type::class);
    }

     protected $appends = ['image_url'];

    public function types()
    {
        return $this->belongsTo(Type::class);
    }

    // 👇 COMPLETE IMAGE URL
    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return asset(Storage::url($this->image));
        }

        return null;
    }
}
