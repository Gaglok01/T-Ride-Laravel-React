<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->decimal('lat', 10, 8)->nullable()->after('address');
            $table->decimal('lng', 11, 8)->nullable()->after('lat');
            $table->decimal('delivery_range_km', 8, 2)->default(10.00)->after('lng');
            $table->decimal('min_order_amount', 8, 2)->default(0.00)->after('delivery_range_km');
            $table->decimal('delivery_fee', 8, 2)->default(0.00)->after('min_order_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->dropColumn(['lat', 'lng', 'delivery_range_km', 'min_order_amount', 'delivery_fee']);
        });
    }
};
