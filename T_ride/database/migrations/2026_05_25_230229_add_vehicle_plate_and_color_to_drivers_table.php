<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->string('vehicle_plate_number')->nullable()->after('vehicle_model');
            $table->string('vehicle_color')->nullable()->after('vehicle_plate_number');
        });
    }

    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn([
                'vehicle_plate_number',
                'vehicle_color'
            ]);
        });
    }
};
