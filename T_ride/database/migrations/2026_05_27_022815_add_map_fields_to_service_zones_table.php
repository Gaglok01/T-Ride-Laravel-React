<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_zones', function (Blueprint $table) {
            if (!Schema::hasColumn('service_zones', 'center_lat')) {
                $table->decimal('center_lat', 10, 7)->nullable()->after('boundaries');
            }
            if (!Schema::hasColumn('service_zones', 'center_lng')) {
                $table->decimal('center_lng', 10, 7)->nullable()->after('center_lat');
            }
            if (!Schema::hasColumn('service_zones', 'radius_meters')) {
                $table->integer('radius_meters')->default(2500)->after('center_lng');
            }
            if (!Schema::hasColumn('service_zones', 'demand_level')) {
                $table->string('demand_level')->default('normal')->after('radius_meters');
            }
            if (!Schema::hasColumn('service_zones', 'surge_multiplier')) {
                $table->decimal('surge_multiplier', 4, 2)->default(1.00)->after('demand_level');
            }
        });
    }

    public function down(): void
    {
        Schema::table('service_zones', function (Blueprint $table) {
            foreach (['center_lat', 'center_lng', 'radius_meters', 'demand_level', 'surge_multiplier'] as $column) {
                if (Schema::hasColumn('service_zones', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
