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
            if (!Schema::hasColumn('drivers', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->onDelete('cascade');
            }
            if (!Schema::hasColumn('drivers', 'address')) {
                $table->string('address')->nullable()->after('name');
            }
            if (!Schema::hasColumn('drivers', 'region')) {
                $table->string('region')->nullable()->after('address');
            }
            if (!Schema::hasColumn('drivers', 'city')) {
                $table->string('city')->nullable()->after('region');
            }
            if (!Schema::hasColumn('drivers', 'is_online')) {
                $table->boolean('is_online')->default(false)->after('status');
            }
            if (!Schema::hasColumn('drivers', 'account_status')) {
                $table->string('account_status')->default('pending')->after('is_online'); // pending, approved, rejected
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            if (Schema::hasColumn('drivers', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }
            
            $columns = ['address', 'region', 'city', 'is_online', 'account_status'];
            $toDrop = [];
            foreach ($columns as $col) {
                if (Schema::hasColumn('drivers', $col)) {
                    $toDrop[] = $col;
                }
            }
            
            if (!empty($toDrop)) {
                $table->dropColumn($toDrop);
            }
        });
    }
};
