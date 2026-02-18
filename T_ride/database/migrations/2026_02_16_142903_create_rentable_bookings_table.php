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
        Schema::create('rentable_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('rentable_item_id')->constrained()->onDelete('cascade');
            $table->string('user_name');
            $table->string('user_phone');
            $table->json('booking_details'); // Dates, occupants, etc.
            $table->json('documents')->nullable(); // CNIC, License, etc.
            $table->string('status')->default('pending'); // pending, approved, rejected, completed
            $table->decimal('total_price', 15, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rentable_bookings');
    }
};
