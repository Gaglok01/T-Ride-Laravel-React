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
        'cnic',
        'license_number',
        'trips',
        'rating',
        'status',
        'background_check_status',
        'background_report_key',
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

    public function user()
    {
        return $this->hasOne(User::class);
    }

    // 👇 COMPLETE IMAGE URL
    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return asset(Storage::url($this->image));
        }

        return null;
    }

    public function rides()
    {
        return $this->hasMany(Ride::class, 'driver_id');
    }

    public function deliveryOrders()
    {
        return $this->hasMany(DeliveryOrder::class, 'driver_id');
    }
}
