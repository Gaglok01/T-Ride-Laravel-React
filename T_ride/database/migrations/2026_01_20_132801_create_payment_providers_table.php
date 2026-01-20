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
        Schema::create('payment_providers', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Stripe, PayPal, MTN MoMo, etc
            $table->string('type')->default('card'); // card, mobile_money, wallet
            $table->string('api_key')->nullable();
            $table->string('secret_key')->nullable();
            $table->text('credentials')->nullable(); // JSON field for additional config
            $table->string('country')->nullable();
            $table->decimal('transaction_fee', 8, 2)->default(0);
            $table->decimal('transaction_limit', 15, 2)->nullable();
            $table->integer('success_rate')->default(98);
            $table->boolean('is_active')->default(true);
            $table->string('status')->default('inactive'); // active, inactive, maintenance
            $table->integer('transaction_count')->default(0);
            $table->decimal('total_processed', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_providers');
    }
};
