<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('driver_challenges', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('reward_amount', 10, 2)->default(0);
            $table->string('challenge_type')->default('rides'); // rides, earnings, courier
            $table->integer('target_value')->default(0);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->string('status')->default('active'); // active, paused, expired
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_challenges');
    }
};
