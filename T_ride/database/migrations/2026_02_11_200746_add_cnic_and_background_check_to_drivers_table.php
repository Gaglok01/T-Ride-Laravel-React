<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->string('cnic')->nullable()->after('vehicle_model');
            $table->string('license_number')->nullable()->after('cnic');
            $table->enum('background_check_status', ['pending', 'verified', 'failed', 'not_checked'])->default('not_checked')->after('status');
            $table->string('background_report_key')->nullable()->after('background_check_status');
        });
    }

    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn(['cnic', 'license_number', 'background_check_status', 'background_report_key']);
        });
    }
};
