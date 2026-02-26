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
        Schema::create('driver_tiers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('color')->nullable();
            $table->decimal('min_rating', 3, 2)->default(0.00);
            $table->decimal('min_completion_rate', 5, 2)->default(0.00);
            $table->integer('min_trips_30d')->default(0);
            $table->integer('max_cancellations_30d')->default(0);
            $table->string('surge_access')->default('Standard');
            $table->boolean('is_stackable')->default(false);
            $table->decimal('bonus_multiplier', 3, 2)->default(1.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('driver_tiers');
    }
};
