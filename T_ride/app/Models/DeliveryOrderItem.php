<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryOrderItem extends Model
{
    /** @use HasFactory<\Database\Factories\DeliveryOrderItemFactory> */
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'unit_price',
        'quantity',
        'total',
        'special_instructions'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
