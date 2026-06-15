<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('driver_promotions', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('reward_amount', 10, 2)->default(0);
            $table->integer('target_rides')->default(0);
            $table->string('service_type')->default('all'); // all, ride, courier
            $table->string('city')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->string('status')->default('active'); // active, paused, expired
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_promotions');
    }
};
