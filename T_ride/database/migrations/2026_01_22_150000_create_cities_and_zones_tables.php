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
        // Cities table
        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('country');
            $table->string('timezone')->nullable();
            $table->string('currency', 10)->nullable();
            $table->json('services')->nullable(); // ["Ride", "Delivery", "Courier"]
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        // Service Zones table
        Schema::create('service_zones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('city_id')->constrained('cities')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('boundaries')->nullable(); // GeoJSON polygon coordinates
            $table->decimal('price_multiplier', 4, 2)->default(1.00);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        // Airports & Transportation Hubs table
        Schema::create('transportation_hubs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('city_id')->constrained('cities')->onDelete('cascade');
            $table->string('name');
            $table->enum('type', ['airport', 'hub', 'station'])->default('airport');
            $table->decimal('pickup_fee', 10, 2)->default(0.00);
            $table->integer('queue_capacity')->default(50);
            $table->json('coordinates')->nullable(); // {"lat": x, "lng": y}
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        // Restricted Areas table
        Schema::create('restricted_areas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('city_id')->constrained('cities')->onDelete('cascade');
            $table->string('name');
            $table->enum('restriction_type', ['no_entry', 'time_based', 'pickup_only', 'dropoff_only'])->default('no_entry');
            $table->string('reason')->nullable();
            $table->string('effective_period')->nullable(); // "Permanent", "Match Days", "Until Dec 2024"
            $table->json('boundaries')->nullable(); // GeoJSON polygon coordinates
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        // Expansion Planning table
        Schema::create('expansion_plans', function (Blueprint $table) {
            $table->id();
            $table->string('city_name');
            $table->string('country');
            $table->enum('stage', ['research', 'partnerships', 'licensing', 'launch_prep', 'launched'])->default('research');
            $table->integer('progress')->default(0); // 0-100
            $table->date('target_launch_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expansion_plans');
        Schema::dropIfExists('restricted_areas');
        Schema::dropIfExists('transportation_hubs');
        Schema::dropIfExists('service_zones');
        Schema::dropIfExists('cities');
    }
};
