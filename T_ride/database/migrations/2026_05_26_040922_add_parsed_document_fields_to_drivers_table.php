<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            if (!Schema::hasColumn('drivers', 'license_expiration')) {
                $table->date('license_expiration')->nullable()->after('license_number');
            }

            if (!Schema::hasColumn('drivers', 'date_of_birth')) {
                $table->date('date_of_birth')->nullable()->after('license_expiration');
            }

            if (!Schema::hasColumn('drivers', 'vehicle_make')) {
                $table->string('vehicle_make')->nullable()->after('vehicle_model');
            }

            if (!Schema::hasColumn('drivers', 'vehicle_year')) {
                $table->string('vehicle_year')->nullable()->after('vehicle_make');
            }

            if (!Schema::hasColumn('drivers', 'vehicle_vin')) {
                $table->string('vehicle_vin')->nullable()->after('vehicle_plate_number');
            }

            if (!Schema::hasColumn('drivers', 'insurance_provider')) {
                $table->string('insurance_provider')->nullable()->after('vehicle_vin');
            }

            if (!Schema::hasColumn('drivers', 'insurance_expiration')) {
                $table->date('insurance_expiration')->nullable()->after('insurance_provider');
            }

            if (!Schema::hasColumn('drivers', 'parsed_documents')) {
                $table->json('parsed_documents')->nullable()->after('documents');
            }
        });
    }

    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $columns = [
                'license_expiration',
                'date_of_birth',
                'vehicle_make',
                'vehicle_year',
                'vehicle_vin',
                'insurance_provider',
                'insurance_expiration',
                'parsed_documents',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('drivers', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
