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
        Schema::create('webhook_configurations', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Payment Success, Payment Failed, Refund, etc
            $table->text('url');
            $table->string('event_type'); // payment.success, payment.failed, refund.completed
            $table->string('status')->default('active'); // active, inactive
            $table->string('secret')->unique();
            $table->integer('retry_count')->default(0);
            $table->timestamp('last_triggered_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('webhook_configurations');
    }
};
