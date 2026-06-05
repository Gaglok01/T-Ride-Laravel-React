<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dispatch_settings', function (Blueprint $table) {
            $table->string('dispatch_mode')
                ->default('balanced')
                ->after('emergency_stop');

            $table->unsignedInteger('max_retry_attempts')
                ->default(3)
                ->after('dispatch_mode');

            $table->unsignedInteger('driver_reject_cooldown_seconds')
                ->default(300)
                ->after('max_retry_attempts');
        });
    }

    public function down(): void
    {
        Schema::table('dispatch_settings', function (Blueprint $table) {
            $table->dropColumn([
                'dispatch_mode',
                'max_retry_attempts',
                'driver_reject_cooldown_seconds',
            ]);
        });
    }
};
