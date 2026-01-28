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
        Schema::create('referral_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type')->default('general'); // driver, user, general
            $table->string('status')->default('draft'); // active, paused, scheduled, ended
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->decimal('budget', 10, 2)->default(0);
            $table->decimal('spent', 10, 2)->default(0);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('referral_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // referrer, referee
            $table->string('trigger_event'); // signup, first_ride, etc.
            $table->string('reward_type')->default('fixed'); // fixed, percentage, credit, points
            $table->decimal('reward_amount', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('referrer_tiers', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Bronze, Silver, Gold, Diamond
            $table->integer('min_referrals')->default(0);
            $table->integer('max_referrals')->nullable(); // null for infinity
            $table->decimal('bonus_multiplier', 5, 2)->default(1.00); // 1.00 = 0% bonus, 1.10 = 10% bonus
            $table->json('benefits')->nullable();
            $table->string('color')->nullable();
            $table->timestamps();
        });

        Schema::create('user_referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('referee_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('campaign_id')->nullable()->constrained('referral_campaigns')->onDelete('set null');
            $table->string('referral_code');
            $table->string('status')->default('pending'); // pending, completed, expired, fraud
            $table->decimal('reward_amount', 10, 2)->default(0);
            $table->dateTime('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_referrals');
        Schema::dropIfExists('referrer_tiers');
        Schema::dropIfExists('referral_rules');
        Schema::dropIfExists('referral_campaigns');
    }
};
