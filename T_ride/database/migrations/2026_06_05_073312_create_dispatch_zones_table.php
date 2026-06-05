<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dispatch_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type')->default('standard');
            $table->decimal('center_lat', 10, 7);
            $table->decimal('center_lng', 10, 7);
            $table->unsignedInteger('radius_meters')->default(3000);
            $table->decimal('surge_multiplier', 4, 2)->default(1.00);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dispatch_zones');
    }
};
