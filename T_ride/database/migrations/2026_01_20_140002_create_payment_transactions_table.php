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
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id')->unique();
            $table->string('reference')->unique();
            $table->foreignId('payment_provider_id')->constrained('payment_providers');
            $table->foreignId('user_id')->constrained('users');
            $table->decimal('amount', 15, 2);
            $table->string('currency')->default('USD');
            $table->string('type'); // payment, refund, chargeback
            $table->string('status')->default('pending'); // pending, success, failed, cancelled
            $table->text('description')->nullable();
            $table->string('payment_method')->nullable(); // card, wallet, mobile_money
            $table->text('metadata')->nullable(); // JSON
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
