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
        Schema::create('pooling_settings', function (Blueprint $table) {
            $table->id();
            // Matching Engine
            $table->integer('min_route_overlap')->default(60);
            $table->integer('max_detour_distance')->default(3);
            $table->integer('max_detour_time')->default(10);
            $table->integer('max_pool_size')->default(3);
            $table->integer('match_window_minutes')->default(5);
            $table->integer('direction_tolerance')->default(30);
            
            // Rider Pricing
            $table->integer('discount_2_riders')->default(25);
            $table->integer('discount_3_riders')->default(35);
            $table->boolean('no_match_guarantee')->default(true);
            $table->decimal('wait_compensation_rider', 8, 2)->default(0.50);
            
            // Driver Payouts
            $table->integer('bonus_2_riders')->default(15);
            $table->integer('bonus_3_riders')->default(25);
            $table->decimal('detour_compensation_km', 8, 2)->default(0.30);
            $table->string('wait_time_pay_type')->default('standard');
            
            // Feature Flags
            $table->boolean('is_pooling_enabled')->default(true);
            $table->boolean('auto_match_riders')->default(true);
            $table->boolean('allow_cross_zone')->default(false);
            $table->boolean('surge_pooling')->default(true);
            $table->boolean('gender_preference')->default(false);
            $table->float('min_rating_filter')->default(4.0);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pooling_settings');
    }
};
