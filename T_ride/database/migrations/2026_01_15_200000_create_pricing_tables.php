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
        // Pricing Zones table for Ride Pricing
        Schema::create('pricing_zones', function (Blueprint $table) {
            $table->id();
            $table->string('zone_id')->unique(); // e.g., PZ-001
            $table->string('name'); // e.g., Metro Area
            $table->string('description')->nullable();
            $table->decimal('base_fare', 10, 2)->default(0);
            $table->decimal('per_km', 10, 2)->default(0);
            $table->decimal('per_minute', 10, 2)->default(0);
            $table->decimal('min_fare', 10, 2)->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        // Vehicle Type Multipliers
        Schema::create('vehicle_type_multipliers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pricing_zone_id')->constrained('pricing_zones')->onDelete('cascade');
            $table->string('vehicle_type'); // Economy, Comfort, Premium, SUV
            $table->decimal('multiplier', 5, 2)->default(1.0);
            $table->timestamps();
        });

        // Package Pricing for Courier
        Schema::create('package_pricing', function (Blueprint $table) {
            $table->id();
            $table->string('package_type')->unique(); // Document, Small, Medium, Large
            $table->decimal('base_price', 10, 2)->default(0);
            $table->decimal('per_km', 10, 2)->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        // Delivery Fees
        Schema::create('delivery_fees', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description')->nullable();
            $table->decimal('base_fee', 10, 2)->default(0);
            $table->decimal('per_km', 10, 2)->default(0);
            $table->decimal('min_order', 10, 2)->default(0); // Minimum order value
            $table->decimal('free_delivery_threshold', 10, 2)->nullable(); // Free delivery above this amount
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        // Surge Rules
        Schema::create('surge_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description')->nullable();
            $table->decimal('multiplier', 5, 2)->default(1.0);
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->json('days')->nullable(); // ['monday', 'tuesday', ...]
            $table->enum('trigger_type', ['time', 'demand', 'weather', 'event'])->default('time');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surge_rules');
        Schema::dropIfExists('delivery_fees');
        Schema::dropIfExists('package_pricing');
        Schema::dropIfExists('vehicle_type_multipliers');
        Schema::dropIfExists('pricing_zones');
    }
};
