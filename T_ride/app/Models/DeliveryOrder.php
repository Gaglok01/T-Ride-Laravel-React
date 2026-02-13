<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryOrder extends Model
{
    protected $fillable = [
        'order_code',
        'customer_id',
        'vendor_id',
        'driver_id',
        'category_id',
        'total_items',
        'total_amount',
        'status',
        'delivery_address',
        'delivery_lat',
        'delivery_lng',
        'contact_phone',
        'delivery_instructions',
        'payment_method',
        'delivery_fee'
    ];

    public function items()
    {
        return $this->hasMany(DeliveryOrderItem::class, 'order_id');
    }

    protected $casts = [
        'total_amount' => 'decimal:2',
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class, 'driver_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
}
