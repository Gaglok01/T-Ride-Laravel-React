<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Support\Facades\Storage;
class Driver extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'driver_id',
        'name',
        'address',
        'region',
        'city',
        'type_id',
        'driver_tier_id',
        'vehicle_model',
        'cnic',
        'license_number',
        'trips',
        'rating',
        'completion_rate',
        'status',
        'is_online',
        'account_status',
        'background_check_status',
        'background_report_key',
        'documents',
        'image',
        'location',
    ];

    protected $casts = [
        'documents' => 'array',
    ];

    public function type()
    {
        return $this->belongsTo(Type::class);
    }

    public function tier()
    {
        return $this->belongsTo(DriverTier::class, 'driver_tier_id');
    }

     protected $appends = ['image_url'];

    public function types()
    {
        return $this->belongsTo(Type::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
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
