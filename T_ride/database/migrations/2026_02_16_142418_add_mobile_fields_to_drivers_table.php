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
        Schema::table('drivers', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->onDelete('cascade');
            $table->string('address')->nullable()->after('name');
            $table->string('region')->nullable()->after('address');
            $table->string('city')->nullable()->after('region');
            $table->boolean('is_online')->default(false)->after('status');
            $table->string('account_status')->default('pending')->after('is_online'); // pending, approved, rejected
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'address', 'region', 'city', 'is_online', 'account_status']);
        });
    }
};
