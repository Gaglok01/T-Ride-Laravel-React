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
        Schema::create('referral_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('program_active')->default(true);
            $table->boolean('auto_approve_rewards')->default(true);
            $table->boolean('allow_custom_codes')->default(true);
            $table->boolean('fraud_detection')->default(true);
            $table->integer('daily_referral_limit')->default(10);
            $table->decimal('monthly_earnings_cap', 10, 2)->default(500.00);
            $table->integer('reward_expiry_days')->default(90);
            $table->decimal('minimum_payout', 10, 2)->default(10.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referral_settings');
    }
};
