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
        Schema::table('driver_reviews', function (Blueprint $table) {
            $table->string('trip_id')->nullable()->after('id');
            $table->integer('rating_dr')->nullable()->after('rating');
            $table->text('driver_comment')->nullable()->after('comment');
        });

        // Rename rating to rating_rd if possible, otherwise we can just use rating as rating_rd
        Schema::table('driver_reviews', function (Blueprint $table) {
            $table->renameColumn('rating', 'rating_rd');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('driver_reviews', function (Blueprint $table) {
            $table->renameColumn('rating_rd', 'rating');
            $table->dropColumn(['trip_id', 'rating_dr', 'driver_comment']);
        });
    }
};
