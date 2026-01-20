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
        Schema::table('surge_rules', function (Blueprint $table) {
            $table->string('trigger_type')->default('time')->change();
            $table->string('weather_condition')->nullable()->after('trigger_type');
            $table->string('event_name')->nullable()->after('weather_condition');
            $table->json('custom_config')->nullable()->after('event_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surge_rules', function (Blueprint $table) {
            $table->dropColumn(['weather_condition', 'event_name', 'custom_config']);
            // We don't necessarily need to change trigger_type back to enum in down()
            // as it would require knowing the exact previous enum values and could fail if data exists.
        });
    }
};
