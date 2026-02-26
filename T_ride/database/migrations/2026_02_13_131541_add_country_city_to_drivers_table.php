<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            if (!Schema::hasColumn('drivers', 'country')) {
                $table->string('country')->nullable();
            }
            if (!Schema::hasColumn('drivers', 'city')) {
                $table->string('city')->nullable();
            }
            if (!Schema::hasColumn('drivers', 'zone')) {
                $table->string('zone')->nullable(); // East, West, North, South, etc.
            }
        });
    }

    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $columns = [];
            if (Schema::hasColumn('drivers', 'country')) $columns[] = 'country';
            if (Schema::hasColumn('drivers', 'city')) $columns[] = 'city';
            if (Schema::hasColumn('drivers', 'zone')) $columns[] = 'zone';
            
            if (!empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};
