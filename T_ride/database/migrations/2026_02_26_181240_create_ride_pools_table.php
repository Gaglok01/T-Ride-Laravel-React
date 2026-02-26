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
        Schema::create('ride_pools', function (Blueprint $table) {
            $table->id();
            $table->string('pool_custom_id')->unique();
            $table->foreignId('driver_id')->constrained('drivers')->onDelete('cascade');
            $table->json('riders'); // Array of rider names
            $table->float('route_overlap');
            $table->float('detour_distance');
            $table->decimal('savings_per_rider', 10, 2);
            $table->integer('eta_minutes');
            $table->string('status')->default('Waiting Match');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ride_pools');
    }
};
