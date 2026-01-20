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
        Schema::create('gateway_settings', function (Blueprint $table) {
            $table->id();
            $table->string('setting_name')->unique();
            $table->text('value');
            $table->string('description')->nullable();
            $table->string('setting_type')->default('general'); // general, fraud, limit, webhook
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gateway_settings');
    }
};
