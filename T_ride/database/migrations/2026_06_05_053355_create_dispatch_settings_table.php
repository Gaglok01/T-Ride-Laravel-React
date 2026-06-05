<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dispatch_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('auto_dispatch_enabled')->default(true);
            $table->decimal('max_search_radius_miles', 8, 2)->default(10);
            $table->unsignedInteger('accept_timeout_seconds')->default(30);
            $table->unsignedInteger('driver_batch_size')->default(3);
            $table->unsignedInteger('stale_order_minutes')->default(5);
            $table->unsignedInteger('distance_weight')->default(40);
            $table->unsignedInteger('rating_weight')->default(20);
            $table->unsignedInteger('vehicle_match_weight')->default(25);
            $table->unsignedInteger('acceptance_rate_weight')->default(15);
            $table->boolean('surge_enabled')->default(false);
            $table->decimal('surge_multiplier', 4, 2)->default(1.00);
            $table->boolean('emergency_stop')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dispatch_settings');
    }
};
