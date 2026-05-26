<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            if (!Schema::hasColumn('drivers', 'insurance_policy_number')) {
                $table->string('insurance_policy_number')->nullable()->after('insurance_provider');
            }
        });
    }

    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            if (Schema::hasColumn('drivers', 'insurance_policy_number')) {
                $table->dropColumn('insurance_policy_number');
            }
        });
    }
};
