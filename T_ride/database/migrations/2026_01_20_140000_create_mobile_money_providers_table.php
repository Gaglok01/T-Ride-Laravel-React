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
        Schema::create('mobile_money_providers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_provider_id')->constrained('payment_providers')->onDelete('cascade');
            $table->string('name'); // MTN MoMo, Orange Money, etc
            $table->string('country');
            $table->string('api_status')->default('connected'); // connected, disconnected
            $table->decimal('transaction_limit', 15, 2); // e.g., 15,000
            $table->decimal('fee_percentage', 5, 2)->default(1.5); // 1.5%
            $table->decimal('today_volume', 15, 2)->default(0);
            $table->integer('transaction_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mobile_money_providers');
    }
};
