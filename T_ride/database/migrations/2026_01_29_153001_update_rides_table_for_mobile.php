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
        Schema::table('rides', function (Blueprint $table) {
            $table->decimal('pickup_lat', 10, 8)->after('pickup_address')->nullable();
            $table->decimal('pickup_lng', 11, 8)->after('pickup_lat')->nullable();
            $table->decimal('dropoff_lat', 10, 8)->after('dropoff_address')->nullable();
            $table->decimal('dropoff_lng', 11, 8)->after('dropoff_lat')->nullable();
            $table->foreignId('vehicle_type_id')->nullable()->after('driver_id')->constrained('types');
            $table->integer('rating')->nullable()->after('status');
            $table->text('comment')->nullable()->after('rating');
            // Change status enum to include 'searching' and 'arrived'
            $table->string('status')->default('pending')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rides', function (Blueprint $table) {
            $table->dropForeign(['vehicle_type_id']);
            $table->dropColumn(['pickup_lat', 'pickup_lng', 'dropoff_lat', 'dropoff_lng', 'vehicle_type_id', 'rating', 'comment']);
        });
    }
};
