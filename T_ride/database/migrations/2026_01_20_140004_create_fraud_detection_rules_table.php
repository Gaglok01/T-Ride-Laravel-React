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
        Schema::create('fraud_detection_rules', function (Blueprint $table) {
            $table->id();
            $table->string('rule_name');
            $table->string('rule_type'); // velocity_check, ip_check, amount_check, pattern_check
            $table->text('rule_condition'); // JSON
            $table->integer('risk_score')->default(0); // 0-100
            $table->string('action')->default('flag'); // flag, block, approve
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fraud_detection_rules');
    }
};
