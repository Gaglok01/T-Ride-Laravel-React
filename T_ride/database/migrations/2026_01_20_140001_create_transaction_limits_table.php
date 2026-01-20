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
        Schema::create('transaction_limits', function (Blueprint $table) {
            $table->id();
            $table->string('limit_type'); // single_transaction, daily, weekly, monthly, yearly
            $table->decimal('amount', 15, 2);
            $table->string('currency')->default('USD');
            $table->string('applicable_to')->default('all'); // all, user, vendor, driver
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_limits');
    }
};
