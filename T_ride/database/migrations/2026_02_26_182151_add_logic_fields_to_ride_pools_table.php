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
        Schema::table('ride_pools', function (Blueprint $table) {
            $table->integer('total_seats')->default(4)->after('riders');
            $table->string('allocation_strategy')->default('Optimal Overlap')->after('status');
            $table->boolean('capacity_confirmed')->default(true)->after('allocation_strategy');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ride_pools', function (Blueprint $table) {
            //
        });
    }
};
