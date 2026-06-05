<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dispatch_attempts', function (Blueprint $table) {
            $table->id();

            $table->string('order_type');
            $table->unsignedBigInteger('order_id');

            $table->unsignedBigInteger('driver_id');

            $table->unsignedInteger('attempt_number')->default(1);

            $table->enum('status', [
                'pending',
                'accepted',
                'rejected',
                'timeout'
            ])->default('pending');

            $table->timestamp('cooldown_until')->nullable();

            $table->timestamps();

            $table->index(['order_type', 'order_id']);
            $table->index(['driver_id']);
            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dispatch_attempts');
    }
};
