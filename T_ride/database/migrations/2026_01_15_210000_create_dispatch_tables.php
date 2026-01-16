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
        // Manual Bookings table - for bookings created by dispatch
        Schema::create('manual_bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_id')->unique(); // e.g., MB-001
            $table->enum('type', ['ride', 'delivery', 'courier'])->default('ride');
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('pickup_address');
            $table->string('dropoff_address');
            $table->decimal('pickup_lat', 10, 8)->nullable();
            $table->decimal('pickup_lng', 11, 8)->nullable();
            $table->decimal('dropoff_lat', 10, 8)->nullable();
            $table->decimal('dropoff_lng', 11, 8)->nullable();
            $table->foreignId('assigned_driver_id')->nullable()->constrained('drivers')->nullOnDelete();
            $table->decimal('fare', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        // Dispatch Logs - for tracking all dispatch actions
        Schema::create('dispatch_logs', function (Blueprint $table) {
            $table->id();
            $table->string('order_type'); // ride, delivery, courier, manual_booking
            $table->unsignedBigInteger('order_id');
            $table->foreignId('driver_id')->nullable()->constrained('drivers')->nullOnDelete();
            $table->foreignId('dispatcher_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('action', ['created', 'assigned', 'reassigned', 'unassigned', 'completed', 'cancelled']);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dispatch_logs');
        Schema::dropIfExists('manual_bookings');
    }
};
