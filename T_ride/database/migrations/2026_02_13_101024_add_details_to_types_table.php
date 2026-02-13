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
        Schema::table('types', function (Blueprint $table) {
            $table->text('description')->nullable()->after('type_name');
            $table->decimal('capacity', 8, 2)->nullable()->after('description'); // e.g., in kg or volume
            $table->decimal('max_weight', 8, 2)->nullable()->after('capacity'); // max weight allowed
            $table->string('photo')->nullable()->after('max_weight');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('types', function (Blueprint $table) {
            $table->dropColumn(['description', 'capacity', 'max_weight', 'photo']);
        });
    }
};
