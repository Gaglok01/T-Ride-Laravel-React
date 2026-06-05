<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_commission_settings', function (Blueprint $table) {
            $table->id();
            $table->string('service_type')->unique(); // ride, courier, delivery
            $table->decimal('commission_percent', 5, 2)->default(20.00);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_commission_settings');
    }
};
